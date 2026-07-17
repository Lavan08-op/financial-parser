from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models import Document, DocumentStatus, User

router = APIRouter()

@router.get("")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(Document).count()
    parsed = db.query(Document).filter(Document.status == DocumentStatus.parsed).count()
    approved = db.query(Document).filter(Document.status == DocumentStatus.approved).count()
    failed = db.query(Document).filter(Document.status == DocumentStatus.validation_failed).count()
    review_pending = db.query(Document).filter(Document.status == DocumentStatus.review_pending).count()
    
    avg_time = db.query(func.avg(Document.processing_time)).scalar() or 0
    
    by_type = db.query(Document.document_type, func.count(Document.id)).group_by(Document.document_type).all()
    
    recent = db.query(Document).order_by(Document.created_at.desc()).limit(5).all()
    
    success_rate = round((parsed + approved) / total * 100, 1) if total > 0 else 0

    return {
        "total_documents": total,
        "successfully_parsed": parsed + approved,
        "failed_parsing": failed,
        "review_pending": review_pending,
        "success_rate": success_rate,
        "avg_processing_time": round(avg_time, 2),
        "documents_by_type": [{"type": t or "unknown", "count": c} for t, c in by_type],
        "recent_activity": [{"id": d.id, "name": d.document_name, "type": d.document_type, "status": d.status, "created_at": d.created_at} for d in recent]
    }