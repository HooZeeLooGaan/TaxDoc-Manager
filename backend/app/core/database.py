import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession

# Get db url from docker compose yaml environment variables
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@db:5432/tax_doc_collector"
)

# Create async sql engine
engine = create_async_engine(
    DATABASE_URL,
    echo = True,
    future = True
)

# Async db Session Factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_= AsyncSession,
    expire_on_commit=False
)

#Dependency injection to yield db session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
