from fastapi import APIRouter, Depends, HTTPException
from app.api.auth import get_current_user, get_current_user_flexible
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import ParsedReport, Document, User, AuditLog
from app.core.config import settings
import openpyxl, uuid, os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime

router = APIRouter()

@router.get("")
def get_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reports = db.query(ParsedReport).order_by(ParsedReport.created_at.desc()).all()
    return [{"id": r.id, "document_id": r.document_id, "validation_status": r.validation_status, "review_status": r.review_status, "created_at": r.created_at} for r in reports]

@router.get("/{report_id}")
def get_report(report_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(ParsedReport).filter(ParsedReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("/export/excel/{doc_id}")
def export_excel(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(ParsedReport).filter(ParsedReport.document_id == doc_id).first()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not report or not doc:
        raise HTTPException(status_code=404, detail="Not found")
    
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    filepath = os.path.join(settings.REPORTS_DIR, f"report_{doc_id}.xlsx")
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Report"
    ws.append(["Field", "Value"])
    ws.append(["Document Name", doc.document_name])
    ws.append(["Document Type", doc.document_type])
    ws.append(["Status", str(doc.status)])
    ws.append(["Processing Time", doc.processing_time])
    ws.append(["Validation Status", report.validation_status])
    ws.append(["Review Status", report.review_status])
    ws.append(["---Extracted Data---", ""])
    
    if report.parsed_data and "extracted" in report.parsed_data:
        for k, v in report.parsed_data["extracted"].items():
            ws.append([k, str(v)])
    
    wb.save(filepath)
    log = AuditLog(id=str(uuid.uuid4()), document_id=doc_id, action="Report Exported (Excel)", status="success", user_id=current_user.id)
    db.add(log)
    db.commit()
    return FileResponse(filepath, filename=f"report_{doc.document_name}.xlsx")

@router.get("/export/excel/{doc_id}")
def export_excel(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_flexible)):
    report = db.query(ParsedReport).filter(ParsedReport.document_id == doc_id).first()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not report or not doc:
        raise HTTPException(status_code=404, detail="Not found")
    
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    filepath = os.path.join(settings.REPORTS_DIR, f"report_{doc_id}.xlsx")
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Report"
    ws.append(["Field", "Value"])
    ws.append(["Document Name", doc.document_name])
    ws.append(["Document Type", doc.document_type])
    ws.append(["Status", str(doc.status)])
    ws.append(["Processing Time", doc.processing_time])
    ws.append(["Validation Status", report.validation_status])
    ws.append(["Review Status", report.review_status])
    ws.append(["---Extracted Data---", ""])
    if report.parsed_data and "extracted" in report.parsed_data:
        for k, v in report.parsed_data["extracted"].items():
            ws.append([k, str(v)])
    wb.save(filepath)
    return FileResponse(filepath, filename=f"report_{doc.document_name}.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@router.get("/export/pdf/{doc_id}")
def export_pdf(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_flexible)):
    report = db.query(ParsedReport).filter(ParsedReport.document_id == doc_id).first()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not report or not doc:
        raise HTTPException(status_code=404, detail="Not found")
    
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    filepath = os.path.join(settings.REPORTS_DIR, f"report_{doc_id}.pdf")
    
    c = canvas.Canvas(filepath, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "Financial Document Parser - Report")
    c.setFont("Helvetica", 12)
    y = 720
    fields = [
        ("Document Name", doc.document_name),
        ("Document Type", doc.document_type or "Unknown"),
        ("Status", str(doc.status)),
        ("Validation Status", report.validation_status or "N/A"),
        ("Review Status", report.review_status or "N/A"),
        ("Processing Time", f"{doc.processing_time}s" if doc.processing_time else "N/A"),
        ("Generated At", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
    ]
    for label, value in fields:
        c.drawString(50, y, f"{label}: {value}")
        y -= 20
    y -= 10
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, "Extracted Fields:")
    y -= 20
    c.setFont("Helvetica", 11)
    if report.parsed_data and "extracted" in report.parsed_data:
        for k, v in report.parsed_data["extracted"].items():
            c.drawString(60, y, f"{k}: {v}")
            y -= 18
            if y < 50:
                c.showPage()
                y = 750
    c.save()
    return FileResponse(filepath, filename=f"report_{doc.document_name}.pdf", media_type="application/pdf")