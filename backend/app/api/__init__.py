from fastapi import APIRouter

from app.api.client_controller import router as client_router
from app.api.requirement_controller import requirement_router, client_requirement_router
from app.api.document_controller import document_router, client_document_router
from app.api.insights_controller import insights_router    

api_router = APIRouter(prefix="/api/v1")

# API routers
api_router.include_router(client_router)
api_router.include_router(client_requirement_router)
api_router.include_router(requirement_router)
api_router.include_router(client_document_router)
api_router.include_router(document_router)
api_router.include_router(insights_router)