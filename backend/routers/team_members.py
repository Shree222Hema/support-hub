from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from backend.db.session import get_db
from backend.schemas.team_member import TeamMemberCreate, TeamMemberResponse
from backend.services import team_member as team_member_service

router = APIRouter()

@router.post("/", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
def create_team_member(member_in: TeamMemberCreate, db: Session = Depends(get_db)):
    """
    Create a new team member.
    """
    return team_member_service.create_team_member(db=db, member_in=member_in)

@router.get("/", response_model=List[TeamMemberResponse])
def read_team_members(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve team members.
    """
    members = team_member_service.get_team_members(db, skip=skip, limit=limit)
    return members

@router.get("/{member_id}", response_model=TeamMemberResponse)
def read_team_member(member_id: UUID, db: Session = Depends(get_db)):
    """
    Get a team member by ID.
    """
    db_member = team_member_service.get_team_member(db, member_id=member_id)
    if db_member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
    return db_member

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team_member(member_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a team member.
    """
    db_member = team_member_service.get_team_member(db, member_id=member_id)
    if db_member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
    team_member_service.delete_team_member(db, db_member=db_member)
    return None
