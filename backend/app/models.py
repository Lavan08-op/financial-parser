from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime
import uuid
import enum
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    user = "user"

class DocumentStatus(str, enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    parsed = "parsed"
    validation_failed = "validation_failed"
    review_pending = "review_pending"
    approved = "approved"
    rejected = "rejected"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    documents = relationship("Document", back_populates="uploader")

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, default=gen_uuid)
    document_name = Column(String, nullable=False)
    document_type = Column(String, nullable=True)
    file_path = Column(String, nullable=False)
    uploaded_by = Column(String, ForeignKey("users.id"))
    status = Column(Enum(DocumentStatus), default=DocumentStatus.uploaded)
    processing_time = Column(Float, nullable=True)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    uploader = relationship("User", back_populates="documents")
    parsed_report = relationship("ParsedReport", back_populates="document", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="document")

class ParsedReport(Base):
    __tablename__ = "parsed_reports"
    id = Column(String, primary_key=True, default=gen_uuid)
    document_id = Column(String, ForeignKey("documents.id"))
    parsed_data = Column(JSON, nullable=True)
    validation_status = Column(String, nullable=True)
    review_status = Column(String, default="pending")
    reviewed_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    document = relationship("Document", back_populates="parsed_report")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=gen_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    action = Column(String, nullable=False)
    status = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)
    processing_time = Column(Float, nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    document = relationship("Document", back_populates="audit_logs")