from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from uuid import UUID
from typing import Optional

from app.models.entities import ingested_documents as TaxDocument

# ---------- Document Repository ----------
# Repository class to deal with database operations with the ingested Tax Documents entity
class DocumentRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # Get document record with its ID
    async def get_docuement_by_id(self, document_id: UUID) -> Optional[TaxDocument]:
        return await self.db.get(TaxDocument, document_id)

    # Get all the document records for a client with client ID
    async def get_documents_by_client_id(self, client_id: UUID) -> list[TaxDocument]:
        query = select(TaxDocument).where(TaxDocument.client_id == client_id)
        result = await self.db.exec(query)
        return list(result.all())

    async def create_document(self, document: TaxDocument) -> TaxDocument:
        self.db.add(document)
        await self.db.commit()
        return document

    # Delete document record matching document ID
    async def delete_document(self, document: TaxDocument):
        await self.db.delete(document)
        await self.db.commit()
        return True
