from fastapi import APIRouter, status, Depends
from uuid import UUID

from app.services.client_service import ClientService
from app.dependencies import get_client_service
from app.schemas.clients import ClientRequest, ClientResponse

router = APIRouter(prefix="/clients", tags=["Clients"])


# Controller endpoint to get a list of all the clients with their details
@router.get("", status_code=status.HTTP_200_OK, response_model=list[ClientResponse])
async def get_clients(service: ClientService = Depends(get_client_service)) -> list[ClientResponse]:
    return await service.get_clients()


# Controller endpoint to get all the details of a particular client
@router.get("/{client_id}", status_code = status.HTTP_200_OK)
async def get_client_requirements(client_id: UUID, service: ClientService = Depends(get_client_service)) -> ClientResponse:
    return await service.get_client_by_id(client_id)


# Controller endpoint to create a new client
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_client(request: ClientRequest, service: ClientService = Depends(get_client_service)) -> ClientResponse:
    return await service.create_client(request)

# Controller endpoint to delete a client
@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: UUID, service: ClientService=Depends(get_client_service)) -> None:
    await service.delete_client(client_id)
