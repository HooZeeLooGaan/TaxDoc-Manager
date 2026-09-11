from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional, Dict, Any

from app.models.entities import ingested_documents as TaxDocument

class DocumentBase(BaseModel):
    file_name: str
    file_id: str = Field(description="Google Drive File ID")
    mime_type: Optional[str] = None
    file_size: Optional[int] = Field(default=None, description="Size in bytes")
    requirement_id: Optional[UUID] = None

class DocumentResponse(DocumentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    client_id: UUID
    file_path: Optional[str]

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
            file_path = model.file_path
        )

    @classmethod
    def from_client(cls, client_response: Dict[str, Any], client_id: UUID, document_id: UUID) -> "DocumentResponse":
        return cls(
            id = document_id,
            client_id = client_id,

            file_id = client_response.get("id", ""),
            file_name = client_response.get("name", "Untitled"),
            file_size=int(client_response.get("size", 0)) if client_response.get("size") else None,
            mime_type=client_response.get("mimeType"),
            file_path = client_response.get("file_path")
        )