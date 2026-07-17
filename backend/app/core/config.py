from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Financial Document Parser"
    SECRET_KEY: str = "supersecretkey123456789012345678"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = ""
    ANTHROPIC_API_KEY: str = ""
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    TESSERACT_CMD: str = r"C:\Users\adity_qugwnqr\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
    UPLOAD_DIR: str = "app/uploads"
    REPORTS_DIR: str = "app/reports"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()