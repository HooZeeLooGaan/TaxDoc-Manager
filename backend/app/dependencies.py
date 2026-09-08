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
from app.clients.ocr_client import OCRClient

# ---------- Database Dependencies ----------
# Yields a database session instance per request
async def get_db() -> AsyncGenerator:
    async with AsyncSessionLocal() as session:
        yield session

# ---------- Client Dependencies ----------
# Clients to interact with external services
async def get_google_drive_client() -> GoogleDriveClient:
    return GoogleDriveClient() 

async def get_ocr_client() -> OCRClient:
    return OCRClient()


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