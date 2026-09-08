from uuid import UUID
from fastapi import HTTPException, status

from app.repositories.client_repository import ClientRepository
from app.repositories.requirement_repository import RequirementRepository
from app.schemas.requirements import RequirementResponse, RequirementRequest, RequirementUpdateRequest
from app.models.entities import requirements as Requirement, Requirement_Source, Requirement_Status, clients as Client

# ---------- Requirement Service ----------
# Service file that holds the busiess logic of requirements
class RequirementService:
    def __init__(self, requirement_repository: RequirementRepository, client_repository: ClientRepository) -> None:
        self.requirement_repository = requirement_repository
        self.client_repository = client_repository

    # Service method to get all the requirements of a client
    async def get_client_requirements(self, client_id: UUID) -> list[RequirementResponse]:
        await self.get_client(client_id)
        requirements = await self.requirement_repository.get_requirements_by_clientid(client_id)
        if not requirements: return []
        return [RequirementResponse.model_validate(requirement) for requirement in requirements]

    # Service method to create a requirement for a client
    async def create_client_requirements(self, client_id: UUID, requirement: RequirementRequest) -> RequirementResponse:
        await self.get_client(client_id)
        requirementEntity = Requirement(
            client_id=client_id,
            document_type=requirement.document_type,
            description=requirement.description,
            is_mandatory=requirement.is_mandatory,
            status=Requirement_Status.PENDING,
            source=Requirement_Source.MANUAL_OVERRIDE
        )
        response = await self.requirement_repository.create_requirement(requirementEntity)
        return RequirementResponse.model_validate(response)

    # Service method to update the values of a requirement entry
    async def update_requirements(self, requirement_id: UUID, requirementRequest: RequirementUpdateRequest) -> RequirementResponse:        
        requirement = await self.get_requirement(requirement_id)
        requirement_update_request = requirementRequest.model_dump(exclude_unset=True)
        requirement = await self.requirement_repository.update_requirement(requirement, requirement_update_request)
        return RequirementResponse.model_validate(requirement)    

    # Service method to remove a requirement record
    async def delete_requirement(self, requirement_id: UUID) -> None:
        requirement = await self.get_requirement(requirement_id)
        await self.requirement_repository.delete_requirement(requirement)

    # Re-evaluate client profile
    async def rederive_client_requirement(self, client_id: UUID) -> list[RequirementResponse]:
        client = await self.get_client(client_id)

        existing_requirements = await self.requirement_repository.get_requirements_by_clientid(client_id) or []
        existing_doc_types = {requirement.document_type for requirement in existing_requirements}

        # Run derivation rules
        new_candidates = await self.derive_base_requirements(client)

        requirements = [
            requirement for requirement in new_candidates if requirement.document_type not in existing_doc_types
        ]
        if requirements:
            await self.requirement_repository.create_many_requirements(requirements)

        requirements = await self.requirement_repository.get_requirements_by_clientid(client_id) or []
        return [RequirementResponse.model_validate(requirement) for requirement in requirements]


    # Private helper methods
    async def derive_base_requirements(self, client: Client):
        derived_requirements: list[Requirement] = []

        # 1. Baseline Requirement for ALL Taxpayers: Government Issued Photo ID
        derived_requirements.append(
            Requirement(
                client_id=client.id,
                document_type="GOVT_ID",
                description="Government-issued Photo ID (Driver's License or Passport)",
                is_mandatory=True,
                status=Requirement_Status.PENDING,
                source=Requirement_Source.SYSTEM_DERIVED,
            )
        )

        # 2. Baseline Form 1040 (Prior Year Tax Return)
        derived_requirements.append(
            Requirement(
                client_id=client.id,
                document_type="FORM_1040",
                description=f"Prior Year Federal Tax Return ({client.tax_year - 1})",
                is_mandatory=True,
                status=Requirement_Status.PENDING,
                source=Requirement_Source.SYSTEM_DERIVED,
            )
        )

        # 3. Income Source Conditional Rules (e.g., W-2s, 1099s)
        # Note: Expand these conditions based on your Client entity flags
        if getattr(client, "has_employment_income", True):
            derived_requirements.append(
                Requirement(
                    client_id=client.id,
                    document_type="FORM_W2",
                    description=f"Form W-2 Wage and Tax Statement for {client.tax_year}",
                    is_mandatory=True,
                    status=Requirement_Status.PENDING,
                    source=Requirement_Source.SYSTEM_DERIVED,
                )
            )

        if getattr(client, "spouse_name", None):
            derived_requirements.append(
                Requirement(
                    client_id=client.id,
                    document_type="SPOUSE_GOVT_ID",
                    description="Spouse's Government-issued Photo ID",
                    is_mandatory=True,
                    status=Requirement_Status.PENDING,
                    source=Requirement_Source.SYSTEM_DERIVED,
                )
            )

        # Bulk save newly derived requirements via repository
        return derived_requirements

    async def get_client(self, client_id) -> Client:
        client = await self.client_repository.get_client_by_id(client_id)
        if not client:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Client with Id {client_id} does not exist")
        return client

    async def get_requirement(self, requirement_id: UUID) -> Requirement:
         requirement = await self.requirement_repository.get_requirement_by_id(requirement_id)
         if not requirement:
              raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
         return requirement