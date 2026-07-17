import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import os
from app.core.config import settings

pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

def extract_text_from_file(file_path: str) -> str:
    ext = file_path.split(".")[-1].lower()
    try:
        if ext == "pdf":
            return extract_from_pdf(file_path)
        else:
            return extract_from_image(file_path)
    except Exception as e:
        return f"OCR Error: {str(e)}"

def extract_from_image(file_path: str) -> str:
    img = Image.open(file_path)
    text = pytesseract.image_to_string(img)
    return text.strip()

def extract_from_pdf(file_path: str) -> str:
    try:
        from pdf2image import convert_from_path
        pages = convert_from_path(file_path, dpi=200)
        full_text = ""
        for page in pages:
            full_text += pytesseract.image_to_string(page) + "\n"
        return full_text.strip()
    except Exception:
        # fallback: try reading as text PDF
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text.strip()
        except:
            return "Could not extract text from PDF"