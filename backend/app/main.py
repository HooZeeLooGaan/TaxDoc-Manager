from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.client_controller import router as client_router
from app.api.requirement_controller import requirement_router, client_requirement_router
from app.api.document_controller import document_router, client_document_router

def create_app() -> FastAPI:
    # Mount the app
    app = FastAPI(
        title = "Tax Document Collector API",
        description="API service to track and manage tax documents submitted by clients",
        version = "0.0.1"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_headers=["*"],
        allow_methods=["*"]
    )

    app.include_router(client_router, prefix="/api/v1")
    app.include_router(client_requirement_router, prefix="/api/v1")
    app.include_router(requirement_router, prefix="/api/v1")
    app.include_router(client_document_router, prefix="/api/v1")
    app.include_router(document_router, prefix="/api/v1")

    @app.get("/")
    async def root():
        return ({"message":"Tax Documentation API is up and running"})

    # Health check API
    @app.get("/health")
    async def health_check():
        return ({"status": "healthy"})
    return app

app = create_app()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)