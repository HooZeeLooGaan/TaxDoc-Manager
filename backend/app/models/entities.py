from uuid import UUID, uuid4
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
from enum import Enum

# Enums
# Highlights the document requirement for a client
class Requirement_Status(Enum):
    PENDING = "PENDING"
    FULFILLED = "FULFILLED"
    WAIVED = "WAIVED"

class Requirement_Source(Enum):
    SYSTEM_DERIVED = "SYSTEM_DERIVED"
    MANUAL_OVERRIDE = "MANUAL_OVERRIDE"

# Entity Classes
class clients(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index = True, nullable= False)
    primary_name: str = Field(max_length=100, nullable=False)
    spouse_name: Optional[str] = Field(max_length=100, nullable=True)
    tax_year: int = Field(nullable=False, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(), nullable=False)

class requirements(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True, nullable=False)
    client_id: UUID = Field(foreign_key = "clients.id", index=True, nullable=False)
    document_type: str = Field(index=True, nullable=False)
    description: Optional[str] = Field(default=None)
    is_mandatory: bool = Field(default=True, nullable=False)
    status: Requirement_Status = Field(default=Requirement_Status.PENDING, nullable=False)
    source: Requirement_Source = Field(default=Requirement_Source.SYSTEM_DERIVED)

class ingested_documents(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True, nullable=False)
    client_id: UUID = Field(foreign_key="clients.id", index=True, nullable=False)
    assigned_requirement_id: UUID = Field(foreign_key= "requirements.id", index=True, nullable=False)

    file_id: str = Field(unique=True, index=True, nullable=False)
    file_name: str = Field(max_length=255, nullable=False)
    file_path: Optional[str] = Field(default=None)
    mime_type: Optional[str] = Field(default=None, max_length=100)
    file_size_bytes: Optional[int] = Field(default=None)
