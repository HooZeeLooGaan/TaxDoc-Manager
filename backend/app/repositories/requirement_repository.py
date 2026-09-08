from uuid import UUID
from typing import Optional, Dict, Any
from sqlmodel import select

from app.core.database import AsyncSession
from app.models.entities import requirements as Requirement

# ---------- Requirement Repository ----------
# Repository function to deal with database operations with Requirement entity
class RequirementRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # Repository function to fetch an entry from Requirements entity
    async def get_requirement_by_id(self, requirement_id: UUID) -> Optional[Requirement]:
        return await self.db.get(Requirement, requirement_id)

    # Repository function to fetch all requirement records matching client id
    async def get_requirements_by_clientid(self, client_id: UUID) -> Optional[list[Requirement]]:
        query = select(Requirement).where(Requirement.client_id == client_id)
        result = await self.db.exec(query)
        return list(result.all())

    # Create a record on the Requirements entity
    async def create_requirement(self,  requirement: Requirement) -> Requirement:
        self.db.add(requirement)
        await self.db.commit()
        await self.db.refresh(requirement)
        return requirement

    async def create_many_requirements(self, requirements: list[Requirement]) -> Optional[list[Requirement]]:
        if not requirements: return []
        self.db.add_all(requirements)
        await self.db.commit()
        for requirement in requirements:
            await self.db.refresh(requirement)
        return requirements

    # Repository function to update requirement entiry records
    async def update_requirement(self, requirement: Requirement, update_data: Dict[str, Any]) -> Requirement:       
        requirement.sqlmodel_update(update_data)
        self.db.add(requirement)
        await self.db.commit()
        await self.db.refresh(requirement)
        return requirement

    # Repository function to delete an entry form Requirements entity
    async def delete_requirement(self, requirement: Requirement):
        await self.db.delete(requirement)
        await self.db.commit()
        return True