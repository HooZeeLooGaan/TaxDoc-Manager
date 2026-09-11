from fastapi import APIRouter, status, Depends, UploadFile, Response
from uuid import UUID
from typing import Optional

from app.services.document_service import DocumentService
from app.dependencies import get_document_service
from app.schemas.documents import DocumentResponse

document_router = APIRouter(prefix="/documents", tags=["Documents"])

# Get document metadata using document ID
@document_router.get("/{document_id}", status_code=status.HTTP_200_OK, response_model=DocumentResponse, summary="Get Document Metadata & Processing Status")
async def get_document_by_id(document_id: UUID, service: DocumentService = Depends(get_document_service)):
    """
        ### Fetch Ingested Document Metadata 📄
        Retrieves metadata, OCR extraction outputs, AI classification results, and review flags for a specific document.

        #### 💡 Key Details:
        * **OCR Raw Output**: View extracted text parsed via PyMuPDF or Tesseract OCR.
        * **AI Metadata**: Access confidence scores, predicted document type, tax year, and extracted JSON payload.
        * **Requirement Linkage**: Check `assigned_requirement_id` to verify if this document has fulfilled a client requirement.
        * **Review Flags**: Inspect `flag_reason` if the document status is set to `NEEDS_REVIEW`.
    """
    return await service.get_document_by_id(document_id)

# fetch and download document content using document ID
@document_router.get("/{document_id}/download", status_code=status.HTTP_200_OK, summary="Retrieve document byte content")
async def get_document_bytes(document_id: UUID, service: DocumentService = Depends(get_document_service)):
    """
        ### Fetch Raw Document File Content 📥
        Streams the raw binary file (PDF, PNG, JPEG) of the ingested document directly from local/cloud storage or Google Drive cache.

        #### 💡 Key Features:
        * **Inline Display vs. Download**: Supports inline previewing in browser document viewers (`inline=true`) or forcing a attachment download (`inline=false`).
        * **Content Types**: Streams dynamic MIME types (`application/pdf`, `image/png`, `image/jpeg`).
        * **UI Integration**: Used directly by the Verification UI side-by-side viewer to display the original document next to OCR results.
    """
    file_bytes = await service.get_document_bytes(document_id)
    return Response(
        content=file_bytes,
        media_type="application/pdf",
    )

# Delete document matching document ID
@document_router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a document")
async def delete_document(document_id: UUID, service: DocumentService = Depends(get_document_service)) -> None:
    """
        ### Delete a document
        Deletes a docuemnt record from the database and also removes it form the file store

        **document_id** checks for document record using this parameter value and returns 404_Not_Found if entry does not exist
    """
    await service.delete_document(document_id)


client_document_router = APIRouter(prefix="/clients/{client_id}/documents", tags=["Documents"])

# Get all the clients' tax and related documents 
@client_document_router.get("", status_code=status.HTTP_200_OK, response_model=list[DocumentResponse], summary="Retrieve all of client's document")
async def get_documents(client_id: UUID, service: DocumentService=Depends(get_document_service)) -> list[DocumentResponse]:
    """
        ### Fetch Ingested Document & Processing Status 📄
        Retrieves metadata, OCR extraction outputs, AI classification results, and verification status for a specific uploaded document.

        #### 💡 Key Features:
        * **OCR Output**: Access raw OCR text (`ocr_raw_text`) extracted via PyMuPDF/Tesseract.
        * **AI Metadata**: View confidence scores, detected document type, and extracted tax entities stored in JSON metadata.
        * **Requirement Tracking**: See which requirement item this document is assigned to (`assigned_requirement_id`).
        * **Verification Flags**: Identifies documents flagged for human review (`NEEDS_REVIEW`) due to low confidence or year/owner mismatches.
    """
    return await service.get_client_documents(client_id)

# Upload a document
@client_document_router.post("/upload", status_code=status.HTTP_201_CREATED, response_model=DocumentResponse, summary="Upload & Ingest document")
async def upload_document(client_id: UUID, file: UploadFile, requirement_id: Optional[UUID] = None, service: DocumentService = Depends(get_document_service)) -> DocumentResponse:
    """
        ### Direct Tax Document Ingestion 📤
        Uploads a physical file (PDF, PNG, JPEG) directly to the system to trigger OCR text extraction, AI classification, and requirement auto-matching.

        #### 💡 Workflow Triggered:
        1. **File Storage**: Saves file metadata and initiates storage.
        2. **OCR Parsing**: Extracts text instantly using **PyMuPDF** (digital PDFs) or **Tesseract** (scanned images).
        3. **Classification & Auto-Matching**: Evaluates document type against target client requirements (`PENDING` $\rightarrow$ `FULFILLED`).
        4. **Initial Status**: Set to `PENDING_CLASSIFICATION` or `PROCESSING` upon upload.

        #### ⚠️ Validation Constraints:
        * **Supported Formats**: `application/pdf`, `image/png`, `image/jpeg`.
        * **File Size Limit**: Max 25 MB.
    """
    return await service.upload_client_document(client_id, file, requirement_id)