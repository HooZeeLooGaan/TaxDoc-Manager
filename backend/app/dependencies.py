import os
from fastapi import Depends
from typing import AsyncGenerator

from app.core.database import AsyncSessionLocal

from app.services.client_service import ClientService
from app.services.requirement_service import RequirementService
from app.services.document_service import DocumentService

from app.repositories.client_repository import ClientRepository
from app.repositories.requirement_repository import RequirementRepository
from app.repositories.document_repository import DocumentRepository

from app.clients.google_drive_client import GoogleDriveClient
from app.clients.tesseract_ocr_client import TesseractOCRClient

# ---------- Database Dependencies ----------
# Yields a database session instance per request
async def get_db() -> AsyncGenerator:
    async with AsyncSessionLocal() as session:
        yield session

# ---------- Client Dependencies ----------
# Clients to interact with external services
async def get_google_drive_client() -> GoogleDriveClient:
    base_url = os.getenv("GOOGLE_DRIVE_URL", "https://www.googleapis.com")
    upload_url = os.getenv("GOOGLE_DRIVE_UPLOAD_URL", "https://www.googleapis.com/upload")
    root_folder = os.getenv("GOOGLE_DRIVE_PARENT_FOLDER_ID")
    client_id = os.getenv("GOOGLE_DRIVE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_DRIVE_CLIENT_SECRET")
    refresh_token = os.getenv("GOOGLE_DRIVE_REFRESH_TOKEN")

    if not root_folder or not client_id or not client_secret or not refresh_token:
        raise RuntimeError("Missing required Google Drive environment variables")

    return GoogleDriveClient(root_folder=root_folder, client_id=client_id, client_secret=client_secret, refresh_token=refresh_token, base_url=base_url, upload_url=upload_url) 

async def get_ocr_client() -> TesseractOCRClient:
    return TesseractOCRClient()


# ---------- Repository Dependencies ----------
# Provides the repository layer, automatically passing the active request-scoped database session straight into its constructor.
def get_client_repository(db = Depends(get_db)) -> ClientRepository:
    return ClientRepository(db = db)

def get_requirement_repository(db = Depends(get_db)) -> RequirementRepository:
    return RequirementRepository(db = db)

def get_document_repository(db = Depends(get_db)) -> DocumentRepository:
    return DocumentRepository(db = db)

# ---------- Service Dependencies ----------
# Provides the business service layer, fully wired with its underlying repository layer dependencies.
def get_client_service(respository = Depends(get_client_repository)) -> ClientService:
    return ClientService(client_repository = respository)

def get_requirement_service(repository = Depends(get_requirement_repository), client_repository = Depends(get_client_repository)) -> RequirementService:
    return RequirementService(requirement_repository = repository, client_repository=client_repository)

def get_document_service(repository = Depends(get_document_repository), client_service = Depends(get_client_service), google_drive_client = Depends(get_google_drive_client), ocr_client = Depends(get_ocr_client)) -> DocumentService:
    return DocumentService(document_repository=repository, client_service=client_service, google_drive_client=google_drive_client, ocr_client=ocr_client)