from fastapi import HTTPException, status
from uuid import UUID

from app.repositories.client_repository import ClientRepository
from app.schemas.clients import ClientRequest, ClientResponse
from app.models.entities import clients as Client

# ---------- Client Service ----------
# Service class that contains the business logic and operations of clients
class ClientService:
    def __init__(self, client_repository: ClientRepository) -> None:
        self.repository = client_repository

    # Get a list of all clients and their details
    async def get_clients(self) -> list[ClientResponse]:
        clients = await self.repository.get_clients()
        return [ClientResponse.model_validate(client) for client in clients]

    # Get details of a client with id $client_id
    async def get_client_by_id(self, client_id: UUID) -> ClientResponse:
        client = await self.repository.get_client_by_id(client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client matching ID {client_id} not found"
            )
        return ClientResponse.model_validate(client)

    # Create a client with client request
    async def create_client(self, request: ClientRequest) -> ClientResponse:
        client_entity = Client(
            primary_name = request.primary_name,
            spouse_name = request.spouse_name,
            tax_year = request.tax_year
        )

        client = await self.repository.create_client(client_entity)
        return ClientResponse.model_validate(client)

    async def delete_client(self, client_id: UUID) -> None:
        client = await self.repository.get_client_by_id(client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client matching ID {client_id} not found"
            )
        await self.repository.delete_client(client)
        