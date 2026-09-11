from fastapi import APIRouter, status, Depends
from uuid import UUID

from app.dependencies import get_requirement_service
from app.services.requirement_service import RequirementService
from app.schemas.requirements import RequirementResponse, RequirementRequest, RequirementUpdateRequest


### Client Requirement Endpoints
client_requirement_router = APIRouter(prefix="/clients/{client_id}/requirements", tags=["Requirements"])

# Controller endpoint to get all requirement of a client
@client_requirement_router.get("", status_code=status.HTTP_200_OK, response_model=list[RequirementResponse], summary="Retrieve client requirements")
async def get_client_requirements(client_id: UUID, service: RequirementService = Depends(get_requirement_service)) -> list[RequirementResponse]:
    """
        ### Fetch Client Tax Requirements Directory 📋
        Retrieves the complete document requirements checklist for a specific client.

        #### 💡 Key Details:
        * **Checklist View**: Returns all derived (`SYSTEM_DERIVED`) and manually added (`MANUAL`) requirement items.
        * **Status Tracking**: Provides visibility into item states (`PENDING`, `FULFILLED`, `WAIVED`).
        * **UI Integration**: Powers the live document checklist in the client portal and admin verification dashboard.
    """
    return await service.get_client_requirements(client_id)

# Controller endpoint to create requirements for a client
@client_requirement_router.post("", status_code=status.HTTP_201_CREATED, response_model=RequirementResponse, summary="Create client requirement")
async def create_client_requirement(client_id: UUID, requirement: RequirementRequest, service: RequirementService=Depends(get_requirement_service)) -> RequirementResponse:
    """
    Manually append a new tax document requirement to a specific client's checklist.

    - **client_id**: Unique UUID of the targeted client.
    - **requirement**: Payload specifying document type, description, and compliance flags.
    - **Returns**: Created requirement object with assigned source (`MANUAL`) and status (`PENDING`).
    - **Raises 404**: If the target client ID does not exist.
    """
    return await service.create_client_requirements(client_id, requirement)

# Trigger document requirement derivation engine for a specific client
@client_requirement_router.post("/rederive", status_code=status.HTTP_200_OK, response_model=list[RequirementResponse], summary="Rederive and Refresh Client Tax Requirements")
async def rederiveRequirements(client_id: UUID, service:RequirementService=Depends(get_requirement_service)) -> list[RequirementResponse]:
    """
        ### Rederive Client Requirements Checklist 🔄

        Recalculates and updates the mandatory and optional document requirements checklist for a target client.

        #### 💡 When to use:
        * **Profile Updates**: Called when a client's tax metadata changes (e.g., modified filing status, newly added self-employment income, or updated filing year).
        * **Manual Refresh**: Triggered via the Admin Verification UI to re-evaluate system compliance rules against the client's current profile state.

        #### ⚙️ Behavior & Safety Rules:
        1. **Preserves Fulfilled Items**: Existing requirements already marked as `FULFILLED` or `WAIVED` are retained to protect verified documents.
        2. **Generates Missing Rules**: Evaluates the latest dynamic rule set and appends any newly required documents (`PENDING` state with `SYSTEM_DERIVED` source).
        3. **Prunes Obsolete Items**: Safely removes unfulfilled, system-derived requirements that no longer apply under the updated client context.

        #### ⚠️ Error Responses:
        * `404 Not Found`: Returned if no client exists for the given `client_id`.
        * `409 Conflict`: Returned if requirement locks or active background sync processes prevent re-evaluation.
    """
    return await service.rederive_client_requirement(client_id)


### Requirement endpoints
requirement_router = APIRouter(prefix="/requirements", tags=["Requirements"])

# Controller endpoint to update a requirement entry
@requirement_router.patch("/{requirement_id}", status_code=status.HTTP_200_OK, response_model=RequirementResponse, summary="Update requirement details")
async def update_requirement(requirement_id: UUID, requirement: RequirementUpdateRequest, service: RequirementService = Depends(get_requirement_service)) -> RequirementResponse:
    """
    Partially update an existing tax requirement entry.

    - **requirement_id**: Unique UUID of the target requirement.
    - **requirement**: Fields to update (e.g., status, mandatory flag, or description).
    - **Returns**: Updated requirement object reflecting saved changes.
    - **Raises 404**: If no requirement matches the provided UUID.
    """
    return await service.update_requirements(requirement_id, requirement)

# Controller endpoint to delete a requirement entry
@requirement_router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a requirement record")
async def delete_requirement(requirement_id: UUID, service: RequirementService = Depends(get_requirement_service)) -> None:
    """
    Remove a requirement from the compliance checklist.

    - **requirement_id**: Unique UUID of the requirement to delete.
    - **Returns**: No content on successful deletion (HTTP 204).
    - **Raises 404**: If the targeted requirement is not found.
    """
    await service.delete_requirement(requirement_id)
    return None