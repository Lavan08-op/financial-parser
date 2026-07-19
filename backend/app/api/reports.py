from datetime import datetime
import os
import uuid

import openpyxl
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.api.auth import get_current_user, get_current_user_flexible
from app.core.config import settings
from app.core.database import get_db
from app.models import AuditLog, Document, ParsedReport, User

router = APIRouter()


@router.get("")
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = db.query(ParsedReport).order_by(ParsedReport.created_at.desc()).all()
    return [
        {
            "id": report.id,
            "document_id": report.document_id,
            "validation_status": report.validation_status,
            "review_status": report.review_status,
            "created_at": report.created_at,
        }
        for report in reports
    ]


@router.get("/{report_id}")
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(ParsedReport).filter(ParsedReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/export/excel/{doc_id}")
def export_excel(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_flexible),
):
    report = db.query(ParsedReport).filter(ParsedReport.document_id == doc_id).first()
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not report or not document:
        raise HTTPException(status_code=404, detail="Not found")

    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    filepath = os.path.join(settings.REPORTS_DIR, f"report_{doc_id}.xlsx")

    workbook = openpyxl.Workbook()
    worksheet = workbook.active
    worksheet.title = "Report"
    worksheet.append(["Field", "Value"])
    worksheet.append(["Document Name", document.document_name])
    worksheet.append(["Document Type", document.document_type])
    worksheet.append(["Status", str(document.status)])
    worksheet.append(["Processing Time", document.processing_time])
    worksheet.append(["Validation Status", report.validation_status])
    worksheet.append(["Review Status", report.review_status])
    worksheet.append(["---Extracted Data---", ""])

    if report.parsed_data and "extracted" in report.parsed_data:
        for key, value in report.parsed_data["extracted"].items():
            worksheet.append([key, str(value)])

    workbook.save(filepath)
    db.add(
        AuditLog(
            id=str(uuid.uuid4()),
            document_id=doc_id,
            action="Report Exported (Excel)",
            status="success",
            user_id=current_user.id,
        )
    )
    db.commit()

    return FileResponse(
        filepath,
        filename=f"report_{document.document_name}.xlsx",
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
    )


@router.get("/export/pdf/{doc_id}")
def export_pdf(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_flexible),
):
    report = db.query(ParsedReport).filter(ParsedReport.document_id == doc_id).first()
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not report or not document:
        raise HTTPException(status_code=404, detail="Not found")

    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    filepath = os.path.join(settings.REPORTS_DIR, f"report_{doc_id}.pdf")

    pdf = canvas.Canvas(filepath, pagesize=letter)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, 750, "Financial Document Parser - Report")
    pdf.setFont("Helvetica", 12)
    y_position = 720
    fields = [
        ("Document Name", document.document_name),
        ("Document Type", document.document_type or "Unknown"),
        ("Status", str(document.status)),
        ("Validation Status", report.validation_status or "N/A"),
        ("Review Status", report.review_status or "N/A"),
        (
            "Processing Time",
            f"{document.processing_time}s" if document.processing_time else "N/A",
        ),
        ("Generated At", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
    ]
    for label, value in fields:
        pdf.drawString(50, y_position, f"{label}: {value}")
        y_position -= 20

    y_position -= 10
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(50, y_position, "Extracted Fields:")
    y_position -= 20
    pdf.setFont("Helvetica", 11)
    if report.parsed_data and "extracted" in report.parsed_data:
        for key, value in report.parsed_data["extracted"].items():
            pdf.drawString(60, y_position, f"{key}: {value}")
            y_position -= 18
            if y_position < 50:
                pdf.showPage()
                y_position = 750

    pdf.save()
    return FileResponse(
        filepath,
        filename=f"report_{document.document_name}.pdf",
        media_type="application/pdf",
    )
