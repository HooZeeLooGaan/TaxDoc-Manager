from uuid import UUID
from typing import Optional, Dict, Any
from fastapi import UploadFile, HTTPException, status

from app.clients.google_drive_client import GoogleDriveClient
from app.clients.tesseract_ocr_client import TesseractOCRClient
from app.repositories.document_repository import DocumentRepository
from app.models.entities import ingested_documents as TaxDocument, DocumentStatus
from app.schemas.documents import DocumentResponse, DocumentBase
from app.services.client_service import ClientService
from app.schemas.clients import ClientResponse

# ---------- Document Service ----------
# Service file to manage clients' tax documents
class DocumentService:
    def __init__(self, document_repository: DocumentRepository, client_service: ClientService, google_drive_client: GoogleDriveClient, ocr_client: TesseractOCRClient) -> None:
        self.document_repository = document_repository
        self.google_drive_client = google_drive_client
        self.ocr_client = ocr_client
        self.client_service = client_service

    # Service function to get all the documents of a client
    async def get_client_documents(self, client_id: UUID, getReviewDocsOnly: bool) -> list[DocumentResponse]:
        response = await self.document_repository.get_documents_by_client_id(client_id, getReviewDocsOnly)
        return [DocumentResponse.from_db(doc) for doc in response]

    # Get document metadata from the document store
    async def get_document_by_id(self, document_id: UUID) -> DocumentResponse:
        document = await self._get_document_from_database(document_id)
        return DocumentResponse.from_db(document)

    # Get file content of document
    async def get_document_metadata(self, drive_file_id: str) -> DocumentBase:
        file_detail = await self.google_drive_client.get_file_metadata(drive_file_id)
        return DocumentBase.from_client(file_detail)

    # Get file content of document
    async def get_document_bytes(self, document_id: UUID) -> bytes:
        document = await self.get_document_by_id(document_id)
        file_bytes = await self.google_drive_client.get_file_content(document.file_id)
        return file_bytes

    # Delete a document record from the database and remove corresponding file from the filestore
    async def delete_document(self, document_id: UUID) -> None:
        document = await self._get_document_from_database(document_id)
        await self.google_drive_client.delete_file(document.file_id)
        await self.document_repository.delete_document(document)

    # Create a document record and upload the document content onto the clients' document store
    async def upload_client_document(self, client_id: UUID, file: UploadFile, requirement_id: Optional[UUID] = None) -> DocumentResponse:
        client = await self._get_client(client_id)
        folder_name = f"{client.primary_name}_{client.id}"
        folder_id = await self.google_drive_client.get_or_create_folder(folder_name)
        file_bytes = await file.read()
        filename = file.filename or "UntitledDoc"
        mime_type = file.content_type or "application/octet-stream"

        drive_file = await self.google_drive_client.upload_file(file_bytes=file_bytes, filename=filename, folder_id=folder_id, mime_type=mime_type)
        file_id = drive_file["id"]
        await self.google_drive_client.update_permission(file_id)

        document = TaxDocument(
            client_id=client_id,
            assigned_requirement_id=requirement_id,
            google_drive_file_id=file_id,
            file_name=filename,
            file_size_bytes=file.size,
            mime_type=file.content_type,
            status=DocumentStatus.PENDING_CLASSIFICATION,
            needs_attention=False
        )
        documentRecord = await self.document_repository.create_document(document)
        return DocumentResponse.from_db(documentRecord)

    # Private helper functions
    # Get the document record from the database and if not found raise an exception
    async def _get_document_from_database(self, document_id: UUID) -> TaxDocument:
        document = await self.document_repository.get_docuement_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID {document_id} does not exist"
            )
        return document

    # Get client details from client service
    async def _get_client(self, client_id: UUID) -> ClientResponse:
        client = await self.client_service.get_client_by_id(client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with ID {client_id} does not exist"
            )
        return client
