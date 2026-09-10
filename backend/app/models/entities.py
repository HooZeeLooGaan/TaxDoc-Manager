from uuid import UUID, uuid4
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID

# ---------- Enums ----------
class RequirementStatus(str, Enum):
    PENDING = "PENDING"
    FULFILLED = "FULFILLED"
    WAIVED = "WAIVED"

class RequirementSource(str, Enum):
    SYSTEM_DERIVED = "SYSTEM_DERIVED"
    MANUAL = "MANUAL"

class DocumentStatus(str, Enum):
    PENDING_CLASSIFICATION = "PENDING_CLASSIFICATION"
    PROCESSING = "PROCESSING"
    EXTRACTED = "EXTRACTED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class FlagReason(str, Enum):
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    YEAR_MISMATCH = "YEAR_MISMATCH"
    OWNER_MISMATCH = "OWNER_MISMATCH"
    UNREADABLE_FILE = "UNREADABLE_FILE"
    MISSING_REQUIREMENT = "MISSING_REQUIREMENT"
    MANUAL_FLAG = "MANUAL_FLAG"


# ---------- Entity Classes ----------
class clients(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True, nullable=False)
    primary_name: str = Field(max_length=100, nullable=False)
    spouse_name: Optional[str] = Field(default=None, max_length=100)
    tax_year: int = Field(nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class requirements(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True, nullable=False)
    client_id: UUID = Field(
        sa_column=Column(
            PG_UUID(as_uuid=True), 
            ForeignKey("clients.id", ondelete="CASCADE"), 
            nullable=False
        )
    )
    document_type: str = Field(index=True, max_length=100, nullable=False)
    description: Optional[str] = Field(default=None)
    is_mandatory: bool = Field(default=True, nullable=False)
    status: RequirementStatus = Field(default=RequirementStatus.PENDING, nullable=False)
    source: RequirementSource = Field(default=RequirementSource.SYSTEM_DERIVED, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class ingested_documents(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True, nullable=False)
    
    client_id: UUID = Field(
        sa_column=Column(
            PG_UUID(as_uuid=True),
            ForeignKey("clients.id"),
            index=True,
            nullable=False
        )
    )
    
    assigned_requirement_id: Optional[UUID] = Field(
        default=None,
        sa_column=Column(
            PG_UUID(as_uuid=True),
            ForeignKey("requirements.id", ondelete="SET NULL"),
            index=True,
            nullable=True
        )
    )

    # Google Drive & File Identification
    google_drive_file_id: str = Field(max_length=255, unique=True, index=True, nullable=False)
    file_name: str = Field(max_length=255, nullable=False)
    file_path: Optional[str] = Field(default=None)
    mime_type: Optional[str] = Field(default=None, max_length=100)
    file_size_bytes: Optional[int] = Field(default=None)

    # Raw & Processed OCR Extraction Content
    ocr_raw_text: Optional[str] = Field(default=None)
    ocr_processed_at: Optional[datetime] = Field(default=None)

    # AI Classification & Verification Insights
    ai_predicted_type: Optional[str] = Field(default=None, max_length=50)
    ai_predicted_year: Optional[int] = Field(default=None)
    ai_predicted_owner: Optional[str] = Field(default=None, max_length=100)
    ai_confidence_score: Optional[float] = Field(default=None)
    ai_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))

    # Verification & Exception Handling Workflow
    status: DocumentStatus = Field(default=DocumentStatus.PENDING_CLASSIFICATION, index=True, nullable=False)
    needs_attention: bool = Field(default=False, index=True, nullable=False)
    flag_reason: Optional[FlagReason] = Field(default=None)
    review_notes: Optional[str] = Field(default=None)
    reviewed_by: Optional[str] = Field(default=None, max_length=255)
    reviewed_at: Optional[datetime] = Field(default=None)

    # Audit Timestamps & Tracking
    uploaded_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)