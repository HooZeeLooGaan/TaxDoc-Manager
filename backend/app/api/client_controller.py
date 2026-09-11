from fastapi import APIRouter, status, Depends
from uuid import UUID

from app.services.client_service import ClientService
from app.dependencies import get_client_service
from app.schemas.clients import ClientRequest, ClientResponse

router = APIRouter(prefix="/clients", tags=["Clients"])

# Controller endpoint to get a list of all the clients with their details
@router.get("", status_code=status.HTTP_200_OK, response_model=list[ClientResponse], summary="Retrieve all clients")
async def get_clients(service: ClientService = Depends(get_client_service)) -> list[ClientResponse]:
    """
    ### Fetch All Clients 👥
    Retrieves the complete list of all registered clients from the database.
    """
    return await service.get_clients()

# Controller endpoint to get all the details of a particular client
@router.get("/{client_id}", status_code = status.HTTP_200_OK, response_model=ClientResponse, summary="Retrieve a single client with its id")
async def get_client_requirements(client_id: UUID, service: ClientService = Depends(get_client_service)) -> ClientResponse:
    """
    Fetch a client record by their unique identifier (UUID).

    - **client_id**: Unique UUID of the targeted client.
    - **Returns**: Client details including basic metadata and current tax profile setup.
    - **Raises 404**: If no client exists with the specified ID.
    """
    return await service.get_client_by_id(client_id)

# Controller endpoint to create a new client
@router.post("", status_code=status.HTTP_201_CREATED, response_model=ClientResponse, summary="Create a new Client")
async def create_client(request: ClientRequest, service: ClientService = Depends(get_client_service)) -> ClientResponse:
    """
    Register a new tax client in the system.

    - **request**: Client payload containing personal/tax entity parameters.
    - **Returns**: Newly created client object along with auto-generated UUID and timestamps.
    - **Raises 400/409**: If payload validation fails or client record already exists.
    """
    return await service.create_client(request)

# Controller endpoint to delete a client
@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a client")
async def delete_client(client_id: UUID, service: ClientService=Depends(get_client_service)) -> None:
    """
    Permanently delete a client record and cascade-remove associated tax metadata.

    - **client_id**: Unique UUID of the client to remove.
    - **Returns**: No content on successful deletion (HTTP 204).
    - **Raises 404**: If the target client ID is not found.
    """
    await service.delete_client(client_id)
