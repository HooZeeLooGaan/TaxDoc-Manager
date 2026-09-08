from uuid import UUID
from typing import Optional
from fastapi import UploadFile, HTTPException, status

from app.clients.google_drive_client import GoogleDriveClient
from app.clients.ocr_client import OCRClient
from app.repositories.document_repository import DocumentRepository
from app.models.entities import ingested_documents as TaxDocument
from app.schemas.documents import DocumentResponse
from app.services.client_service import ClientService
from app.schemas.clients import ClientResponse

# ---------- Document Service ----------
# Service file to manage clients' tax documents
class DocumentService:
    def __init__(self, document_repository: DocumentRepository, client_service: ClientService, google_drive_client: GoogleDriveClient, ocr_client: OCRClient) -> None:
        self.document_repository = document_repository
        self.google_drive_client = google_drive_client
        self.ocr_client = ocr_client
        self.client_service = client_service

    # Service function to get all the documents of a client
    async def get_client_documents(self, client_id: UUID):
        response = await self.document_repository.get_documents_by_client_id(client_id)
        return [DocumentResponse.from_db(doc) for doc in response]

    # Get document metadata from the document store
    async def get_document_by_id(self, document_id: UUID) -> DocumentResponse:
        document = await self.get_document_from_database(document_id)
        return DocumentResponse.from_db(document)

    # Get file content of document
    async def get_document_bytes(self, document_id: UUID) -> bytes:
        document = await self.get_document_by_id(document_id)
        file_bytes = self.google_drive_client.get_document_bytes(document.file_id)
        return file_bytes

    # Delete a document record from the database and remove corresponding file from the filestore
    async def delete_document(self, document_id: UUID) -> None:
        document = await self.get_document_from_database(document_id)
        self.google_drive_client.delete_file(document.file_id)

    async def upload_client_document(self, client_id: UUID, file: UploadFile, requirement_id: Optional[UUID] = None) -> DocumentResponse:
        client = await self.get_client(client_id)

        folder_id = self.google_drive_client.get_or_create_client_folder(client_id, client.primary_name)

        file_bytes = await file.read()

        drive_file = self.google_drive_client.upload_file_bytes(file_bytes=file_bytes, filename=file.filename or "UntitledDoc", folder_id=folder_id, content_type=file.content_type or "application/octet-stream")

        document = TaxDocument(
            client_id=client_id,
            assigned_requirement_id=requirement_id or UUID(),
            file_id=drive_file["drive_file_id"],
            file_name=file.filename or "untitled_file",
            mime_type=file.content_type or "application/octet-stream",
            # web_view_link=drive_file.get("web_view_link")
        )
        documentRecord = await self.document_repository.create_document(document)
        return DocumentResponse.from_db(documentRecord)


    


    # 
    # async def upload_file(self, client_id: UUID, file: UploadFile) -> None:
    #     folder_id = await self.google_drive_client.get_folder_by_name(f"Tax_Doc_{client_id}")
    #     if not folder_id:
    #         folder_id = await self.google_drive_client.create_folder(f"Tax_Doc_{client_id}")
    #     await self.google_drive_client.upload_file(file, folder_id)
         
    



    # Get the document record from the database and if not found raise an exception
    async def get_document_from_database(self, document_id: UUID) -> TaxDocument:
        document = await self.document_repository.get_docuement_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID {document_id} does not exist"
            )
        return document

    async def get_client(self, client_id: UUID) -> ClientResponse:
        client = await self.client_service.get_client_by_id(client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client with ID {client_id} does not exist"
            )
        return client
