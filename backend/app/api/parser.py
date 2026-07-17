from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models import Document, ParsedReport, AuditLog, DocumentStatus, User
from app.services.ocr_service import extract_text_from_file
from app.services.ai_service import classify_and_extract
from app.services.validation_service import validate_extracted_data
from pydantic import BaseModel
from typing import Optional
import uuid, time
from datetime import datetime

router = APIRouter()

class ReviewUpdate(BaseModel):
    parsed_data: Optional[dict] = None
    review_status: Optional[str] = None
    remarks: Optional[str] = None

def process_document(doc_id: str, db: Session, user_id: str):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        return
    
    start = time.time()
    doc.status = DocumentStatus.processing
    db.commit()

    try:
        # OCR
        raw_text = extract_text_from_file(doc.file_path)
        
        log = AuditLog(id=str(uuid.uuid4()), document_id=doc_id, action="OCR Completed", status="success", user_id=user_id)
        db.add(log)
        db.commit()

        # AI Parse
        result = classify_and_extract(raw_text)
        doc.document_type = result.get("document_type", "unknown")
        
        log2 = AuditLog(id=str(uuid.uuid4()), document_id=doc_id, action="AI Parsing Completed", status="success", user_id=user_id)
        db.add(log2)

        # Validate
        validation = validate_extracted_data(doc.document_type, result.get("extracted_data", {}))
        
        processing_time = round(time.time() - start, 2)
        doc.processing_time = processing_time

        # Save report
        existing = db.query(ParsedReport).filter(ParsedReport.document_id == doc_id).first()
        if existing:
            existing.parsed_data = {
                "raw_text": raw_text[:500],
                "extracted": result.get("extracted_data", {}),
                "confidence": result.get("confidence", 0),
                "document_type": doc.document_type
            }
            existing.validation_status = "valid" if validation["is_valid"] else "invalid"
            existing.updated_at = datetime.utcnow()
        else:
            report = ParsedReport(
                id=str(uuid.uuid4()),
                document_id=doc_id,
                parsed_data={
                    "raw_text": raw_text[:500],
                    "extracted": result.get("extracted_data", {}),
                    "confidence": result.get("confidence", 0),
                    "document_type": doc.document_type,
                    "validation": validation
                },
                validation_status="valid" if validation["is_valid"] else "invalid",
                review_status="pending"
            )
            db.add(report)

        doc.status = DocumentStatus.parsed if validation["is_valid"] else DocumentStatus.review_pending
        db.commit()

    except Exception as e:
        doc.status = DocumentStatus.review_pending
        log_err = AuditLog(id=str(uuid.uuid4()), document_id=doc_id, action="Parsing Failed", status="error", remarks=str(e), user_id=user_id)
        db.add(log_err)
        db.commit()

@router.post("/process/{doc_id}")
def process(doc_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    background_tasks.add_task(process_document, doc_id, db, current_user.id)
    return {"message": "Processing started", "document_id": doc_id}

@router.post("/reprocess/{doc_id}")
def reprocess(doc_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return process(doc_id, background_tasks, db, current_user)

@router.get("/result/{doc_id}")
def get_result(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(ParsedReport).filter(ParsedReport.document_id == doc_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="No results yet")
    return report

@router.put("/review/{doc_id}")
def update_review(doc_id: str, update: ReviewUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(ParsedReport).filter(ParsedReport.document_id == doc_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if update.parsed_data:
        report.parsed_data = update.parsed_data
    if update.review_status:
        report.review_status = update.review_status
        report.reviewed_by = current_user.id
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = DocumentStatus.approved if update.review_status == "approved" else DocumentStatus.rejected
    log = AuditLog(id=str(uuid.uuid4()), document_id=doc_id, action=f"Manual Review - {update.review_status}", status="success", remarks=update.remarks, user_id=current_user.id)
    db.add(log)
    db.commit()
    return {"message": "Review updated"}