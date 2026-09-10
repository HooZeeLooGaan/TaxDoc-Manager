import io
from typing import Any
import fitz  # PyMuPDF
import pytesseract  # type: ignore[import-untyped]
from PIL import Image

# ---------- Tesseract OCR Client -----------
# Client class that interacts with Tesseract OCR APIs for performing opticak chgarecter recognition over the uploaded client documents
class TesseractOCRClient:
    def __init__(self, tesseract_cmd: str | None = None) -> None:
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    # Process document bytes to extract content using Tesseract OCR
    def process_document(self, file_bytes: bytes, mime_type: str) -> str:
        if mime_type.startswith("image/"):
            return self._extract_image_ocr(file_bytes)

        elif mime_type == "application/pdf":
            return self._extract_pdf_text(file_bytes)

        raise ValueError(f"Unsupported MIME type for OCR processing: {mime_type}")

    # Process image document
    def _extract_image_ocr(self, file_bytes: bytes) -> str:
        with Image.open(io.BytesIO(file_bytes)) as raw_img:
            img = raw_img.convert("L")
            return pytesseract.image_to_string(img, config="--psm 3").strip()

    # Process text document
    def _extract_pdf_text(self, file_bytes: bytes) -> str:
        full_text: list[str] = []

        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page_raw in doc:
                page: Any = page_raw  # Fixes Pylance type check
                native_text = str(page.get_text("text")).strip()

                # Fallback to OCR if page has negligible native text (e.g., pure scan or background noise)
                if len(native_text) > 30:
                    full_text.append(native_text)
                else:
                    # Render page at 200 DPI for clear OCR detection
                    pix = page.get_pixmap(dpi=200)
                    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples).convert("L")
                    
                    ocr_text = pytesseract.image_to_string(img, config="--psm 3").strip()
                    if ocr_text:
                        full_text.append(ocr_text)

        return "\n\n".join(full_text)