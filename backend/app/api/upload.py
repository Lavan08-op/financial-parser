from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models import Document, AuditLog, DocumentStatus, User
import uuid, os, shutil
from datetime import datetime
from app.core.config import settings

router = APIRouter()

ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
MAX_SIZE = 25 * 1024 * 1024  # 25MB

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, PNG allowed.")
    
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 25MB.")
    
    doc_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1]
    file_path = os.path.join(settings.UPLOAD_DIR, f"{doc_id}.{ext}")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    with open(file_path, "wb") as f:
        f.write(contents)
    
    doc = Document(
        id=doc_id,
        document_name=file.filename,
        file_path=file_path,
        uploaded_by=current_user.id,
        status=DocumentStatus.uploaded,
        file_size=len(contents)
    )
    db.add(doc)
    
    log = AuditLog(
        id=str(uuid.uuid4()),
        document_id=doc_id,
        action="Document Uploaded",
        status="success",
        user_id=current_user.id
    )
    db.add(log)
    db.commit()
    db.refresh(doc)
    
    return {"id": doc.id, "document_name": doc.document_name, "status": doc.status, "file_size": doc.file_size, "created_at": doc.created_at}

@router.get("")
def get_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        docs = db.query(Document).order_by(Document.created_at.desc()).all()
    else:
        docs = db.query(Document).filter(Document.uploaded_by == current_user.id).order_by(Document.created_at.desc()).all()
    return [{"id": d.id, "document_name": d.document_name, "document_type": d.document_type, "status": d.status, "file_size": d.file_size, "processing_time": d.processing_time, "created_at": d.created_at} for d in docs]

@router.get("/{doc_id}")
def get_document(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete documents")
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}