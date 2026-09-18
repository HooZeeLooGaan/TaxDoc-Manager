from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any

from app.models.entities import ingested_documents as TaxDocument, FlagReason, DocumentStatus

class DocumentBase(BaseModel):
    file_name: str
    file_id: str = Field(description="Google Drive File ID")
    mime_type: Optional[str] = None
    file_size: Optional[int] = Field(default=None, description="Size in bytes")
    file_path: Optional[str]

    @classmethod
    def from_client(cls, dict: Dict[str, Any]) -> "DocumentBase":
        return cls(
            file_name = dict["name"],
            file_id = dict["id"],
            mime_type = dict["mimeType"],
            file_size = dict["size"],
            file_path = dict["webViewLink"]
        )

class DocumentInsights(BaseModel):
    confidence_score: Optional[float]
    predicted_type: Optional[str]
    predicted_year: Optional[int]
    predicted_owner: Optional[str]
    flag_reason: Optional[FlagReason]
    status: DocumentStatus    

class DocumentResponse(DocumentBase, DocumentInsights):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    client_id: UUID
    requirement_id: Optional[UUID] = None

    @classmethod
    def from_db(cls, model: TaxDocument) -> "DocumentResponse":
        return cls(
            id = model.id,
            client_id = model.client_id,
            requirement_id = model.assigned_requirement_id,

            file_name = model.file_name,
            file_id = model.google_drive_file_id,
            file_size = model.file_size_bytes,
            mime_type = model.mime_type,
            file_path = model.file_path,
            status = model.status,

            confidence_score = round(model.ai_confidence_score * 100) if model.ai_confidence_score else None,
            predicted_type = model.ai_predicted_type,
            predicted_year = model.ai_predicted_year,
            predicted_owner = model.ai_predicted_owner,
            flag_reason = model.flag_reason
        )