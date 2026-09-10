from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api import api_router

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

    app.include_router(api_router)

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