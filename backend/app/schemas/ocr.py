from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class DocInsightsRequest(BaseModel):
    document_id: UUID = Field(..., description="UUID of the ingested document")
    expected_doc_type: Optional[str] = Field(None, description="e.g., Form 16, W-2, 1099")

class AIScoreBreakdown(BaseModel):
    overall_confidence: int = Field(..., ge=0, le=100)
    detected_doc_type: str
    has_valid_tax_year: bool
    has_financial_amounts: bool