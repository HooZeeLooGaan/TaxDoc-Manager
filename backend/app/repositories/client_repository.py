from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, desc
from uuid import UUID
from typing import Optional

from app.models.entities import clients as Client

# ---------- Client Repository ----------
# Clients repository class to interact with database entity clients
class ClientRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # Get all the client entries on the clients entity
    async def get_clients(self) -> list[Client]:
        query = select(Client).order_by(desc(Client.created_at))
        results = await self.db.exec(query)
        return list(results.all())

    # Get client matching client id
    async def get_client_by_id(self, client_id: UUID) -> Optional[Client]:
        return await self.db.get(Client, client_id)

    # Create a client entry on the database
    async def create_client(self, client: Client) -> Client:
        self.db.add(client)
        await self.db.commit()
        await self.db.refresh(client)
        return client

    # Delete database client entry matching client id
    async def delete_client(self, client: Client) -> bool:
        await self.db.delete(client)
        await self.db.commit()
        return True