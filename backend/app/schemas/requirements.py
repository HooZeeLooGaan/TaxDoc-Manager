from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional

from app.models.entities import RequirementSource, RequirementStatus

class RequirementResponse(BaseModel):
    id: UUID
    client_id: UUID
    document_type: str
    description: Optional[str]
    is_mandatory: bool
    status: RequirementStatus
    source: RequirementSource

    model_config = ConfigDict(from_attributes=True)

class RequirementRequest(BaseModel):
    document_type: str
    description: Optional[str] = None
    is_mandatory: bool = True

class RequirementUpdateRequest(BaseModel):
    status: Optional[RequirementStatus] = None
    description: Optional[str] = None
    is_mandatory: Optional[bool] = True

