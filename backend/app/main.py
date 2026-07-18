from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
import os

# Create tables
Base.metadata.create_all(bind=engine)

# Create dirs
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)

app = FastAPI(title=settings.PROJECT_NAME, docs_url="/docs", redoc_url="/redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://financial-parser-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from app.api import auth, upload, parser, reports, dashboard, logs

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(upload.router, prefix="/api/documents", tags=["documents"])
app.include_router(parser.router, prefix="/api/parser", tags=["parser"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(logs.router, prefix="/api/logs", tags=["logs"])

@app.get("/")
def root():
    return {"message": "Financial Document Parser API", "docs": "/docs"}