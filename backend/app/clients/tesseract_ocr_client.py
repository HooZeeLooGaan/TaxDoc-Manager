import io
from typing import Any
import fitz  # PyMuPDF
import pytesseract  # type: ignore[import-untyped]
from PIL import Image


class TesseractOCRClient:

    def __init__(self, tesseract_cmd: str | None = None) -> None:
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    def process_document(self, file_bytes: bytes, mime_type: str) -> str:
        if mime_type.startswith("image/"):
            img = Image.open(io.BytesIO(file_bytes)).convert("L")
            return pytesseract.image_to_string(img, config="--psm 6").strip()

        elif mime_type == "application/pdf":
            full_text = []

            with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                for page_raw in doc:
                    page: Any = page_raw  # Fixes Pylance attribute resolution

                    native_text = str(page.get_text()).strip()

                    if native_text:
                        full_text.append(native_text)
                    else:
                        pix = page.get_pixmap(dpi=200)
                        img = Image.frombytes(
                            "RGB", (pix.width, pix.height), pix.samples
                        ).convert("L")
                        ocr_text = pytesseract.image_to_string(
                            img, config="--psm 6"
                        ).strip()
                        full_text.append(ocr_text)

            return "\n\n".join(full_text)

        raise ValueError(f"Unsupported MIME type: {mime_type}")