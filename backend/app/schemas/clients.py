from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime

class ClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    primary_name: str
    spouse_name: Optional[str] = None
    tax_year: int
    created_at: datetime

class ClientRequest(BaseModel):
    primary_name: str = Field(..., max_length=50)
    spouse_name: Optional[str] = Field(None, max_length=50)
    tax_year: int = Field()