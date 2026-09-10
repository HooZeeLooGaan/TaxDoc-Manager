import re
import asyncio
from datetime import datetime
from fastapi import HTTPException, status
from typing import Optional

from app.schemas.ocr import DocInsightsRequest, AIScoreBreakdown
from app.schemas.documents import DocumentResponse
from app.clients.tesseract_ocr_client import TesseractOCRClient
from app.clients.google_drive_client import GoogleDriveClient
from app.repositories.document_repository import DocumentRepository
from app.models.entities import ingested_documents as TaxDocument, DocumentStatus, FlagReason

# ---------- Document Insight Service ----------
# Process a document via OCR and infer document insights 
class InsightsService():
    def __init__(self, ocr_client: TesseractOCRClient, google_drive_client: GoogleDriveClient, document_repository: DocumentRepository) -> None:
        self.ocr_client = ocr_client
        self.google_drive_client = google_drive_client
        self.document_repository = document_repository

    # Process a document to gain insights via using OCR and flag its metadata on the repoistory for review
    async def process_document(self, request: DocInsightsRequest) -> DocumentResponse:
        document = await self.document_repository.get_docuement_by_id(request.document_id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="The requested document record is not found")
        
        document_bytes = await self.google_drive_client.get_file_content(document.file_id)
        if not document_bytes:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="The requested document is not found at the document store")

        mime_type = document.mime_type or "application/pdf"
        document_text = await asyncio.to_thread(
            self.ocr_client.process_document, document_bytes, mime_type
        )

        document_analysis = self._document_ai_analysis(document_text)
        return await self._update_document_record(document = document, raw_text = document_text, document_analysis=document_analysis)

    # Return AI confidence score over the document with OCR analysis
    def _document_ai_analysis(self, raw_text: str, expected_type: Optional[str] = None) -> AIScoreBreakdown:
        score = 50  # Baseline starting score for readable text
        text_upper = raw_text.upper()

        # 1. Tax year detection (e.g., 2024, 2025, 2025-26)
        has_year = bool(re.search(r'\b(202[0-9])\b', raw_text))
        if has_year:
            score += 20

        # 2. Financial currency amounts detection (e.g., INR 10,000 or $1,000.00)
        has_amounts = bool(re.search(r'(\$|INR|RS\.?)\s?\d+(?:,\d+)*(?:\.\d{2})?', text_upper))
        if has_amounts:
            score += 15

        # 3. Document Type Keyword Match
        detected_type = "UNKNOWN"
        if "FORM NO. 16" in text_upper or "SECTION 203" in text_upper:
            detected_type = "Form 16"
            score += 15
        elif "W-2" in text_upper or "WAGE AND TAX STATEMENT" in text_upper:
            detected_type = "W-2"
            score += 15
        elif "1099" in text_upper:
            detected_type = "1099"
            score += 15

        # Cap score between 0 and 100
        final_score = min(max(score, 0), 100)

        return AIScoreBreakdown(
            overall_confidence=final_score,
            detected_doc_type=detected_type,
            has_valid_tax_year=has_year,
            has_financial_amounts=has_amounts
        )

    # Update OCR analysis on document db record
    async def _update_document_record(self, document: TaxDocument, raw_text: str, document_analysis: AIScoreBreakdown) -> DocumentResponse:
        # model mapping based on AI score
        document.ocr_raw_text = raw_text
        document.ocr_processed_at = datetime.utcnow()

        document.ai_confidence_score = document_analysis.overall_confidence
        document.ai_predicted_type = document_analysis.detected_doc_type

        document.ai_confidence_score = document_analysis.overall_confidence
        document.status = DocumentStatus.NEEDS_REVIEW
        document.ai_metadata = {
            "detected_doc_type": document_analysis.detected_doc_type,
            "has_valid_tax_year": document_analysis.has_valid_tax_year,
            "has_financial_amounts": document_analysis.has_financial_amounts
        }

        if document_analysis.overall_confidence < 0.75:  # Adjust threshold as needed
            document.status = DocumentStatus.NEEDS_REVIEW
            document.needs_attention = True
            document.flag_reason = FlagReason.LOW_CONFIDENCE
        else:
            document.status = DocumentStatus.EXTRACTED
            document.needs_attention = False

        document.updated_at = datetime.utcnow()

        document = await self.document_repository.update_document(document)    
        return DocumentResponse.from_db(document)