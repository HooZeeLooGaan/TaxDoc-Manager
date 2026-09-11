from fastapi import APIRouter, status, Depends

from app.schemas.ocr import DocInsightsRequest
from app.schemas.documents import DocumentResponse
from app.services.insights_service import InsightsService
from app.dependencies import get_insights_service

insights_router = APIRouter(prefix="/insights", tags=["Insights"])

# Enpoint to process a document for insights using an OCR
@insights_router.post("/process", status_code=status.HTTP_200_OK,response_model=DocumentResponse)
async def process_document(payload: DocInsightsRequest, service: InsightsService = Depends(get_insights_service)) -> DocumentResponse:
    """
    Consume document from file store and trigger OCR to analyze the document for insights.
    Returned insights are updated on document's database record.

    - **doc_insights_request**: conmtains document ID whose insights are to be extracted.
    
    Returns the document record after updating the ai adn ocr related fields.
    """
    return await service.process_document(payload)