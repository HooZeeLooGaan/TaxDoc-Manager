from fastapi import APIRouter, status, Depends, UploadFile
from uuid import UUID

from app.services.document_service import DocumentService
from app.dependencies import get_document_service

document_router = APIRouter(prefix="/documents", tags=["Documents"])

# Get document metadata using document ID
@document_router.get("/{document_id}", status_code=status.HTTP_200_OK)
async def get_document_by_id(document_id: UUID, service: DocumentService = Depends(get_document_service)):
    return await service.get_document_by_id(document_id)

# fetch and download document content using document ID
@document_router.get("/{document_id}/download", status_code=status.HTTP_200_OK)
async def get_document_bytes(document_id: UUID, service: DocumentService = Depends(get_document_service)):
    return await service.get_document_bytes(document_id)

# Delete document matching document ID
@document_router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: UUID, service: DocumentService = Depends(get_document_service)) -> None:
    await service.delete_document(document_id)


client_document_router = APIRouter(prefix="/clients/{client_id}/documents", tags=["Documents"])

@client_document_router.get("", status_code=status.HTTP_200_OK)
async def get_documents(client_id: UUID, service: DocumentService=Depends(get_document_service)):
    return await service.get_client_documents(client_id)

@client_document_router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(client_id: UUID, file: UploadFile, service: DocumentService = Depends(get_document_service)):
    return await service.upload_client_document(client_id, file)