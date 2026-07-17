from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models import AuditLog, User

router = APIRouter()

@router.get("")
def get_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return [{"id": l.id, "document_id": l.document_id, "action": l.action, "status": l.status, "remarks": l.remarks, "created_at": l.created_at} for l in logs]