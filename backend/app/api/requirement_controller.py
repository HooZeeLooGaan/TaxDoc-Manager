from fastapi import APIRouter, status, Depends
from uuid import UUID

from app.dependencies import get_requirement_service
from app.services.requirement_service import RequirementService
from app.schemas.requirements import RequirementResponse, RequirementRequest, RequirementUpdateRequest



### Client Requirement Endpoints
client_requirement_router = APIRouter(prefix="/clients/{client_id}/requirements", tags=["Requirements"])

# Controller endpoint to get all requirement of a client
@client_requirement_router.get("", status_code=status.HTTP_200_OK, response_model=list[RequirementResponse])
async def get_client_requirements(client_id: UUID, service: RequirementService = Depends(get_requirement_service)) -> list[RequirementResponse]:
    return await service.get_client_requirements(client_id)

# Controller endpoint to create requirements for a client
@client_requirement_router.post("", status_code=status.HTTP_201_CREATED, response_model=RequirementResponse)
async def create_client_requirement(client_id: UUID, requirement: RequirementRequest, service: RequirementService=Depends(get_requirement_service)) -> RequirementResponse:
    return await service.create_client_requirements(client_id, requirement)

# Trigger document requirement derivation engine for a specific client
@client_requirement_router.post("/rederive", status_code=status.HTTP_200_OK, response_model=list[RequirementResponse])
async def rederiveRequirements(client_id: UUID, service:RequirementService=Depends(get_requirement_service)) -> list[RequirementResponse]:
    return await service.rederive_client_requirement(client_id)



### Requirement endpoints
requirement_router = APIRouter(prefix="/requirements", tags=["Requirements"])

# Controller endpoint to update a requirement entry
@requirement_router.patch("/{requirement_id}", status_code=status.HTTP_200_OK, response_model=RequirementResponse)
async def update_requirement(requirement_id: UUID, requirement: RequirementUpdateRequest, service: RequirementService = Depends(get_requirement_service)) -> RequirementResponse:
    return await service.update_requirements(requirement_id, requirement)

# Controller endpoint to delete a requirement entry
@requirement_router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_requirement(requirement_id: UUID, service: RequirementService = Depends(get_requirement_service)) -> None:
    await service.delete_requirement(requirement_id)
    return None