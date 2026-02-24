from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID
from typing import List, Optional
from app.models.team_member import TeamMember
from app.schemas.team_member import TeamMemberCreate
from fastapi import HTTPException, status

def get_team_member(db: Session, member_id: UUID) -> Optional[TeamMember]:
    return db.query(TeamMember).filter(TeamMember.id == member_id).first()

def get_team_members(db: Session, skip: int = 0, limit: int = 100) -> List[TeamMember]:
    return db.query(TeamMember).offset(skip).limit(limit).all()

def create_team_member(db: Session, member_in: TeamMemberCreate) -> TeamMember:
    db_member = TeamMember(**member_in.model_dump())
    db.add(db_member)
    try:
        db.commit()
        db.refresh(db_member)
        return db_member
    except IntegrityError as e:
        db.rollback()
        if "unique" in str(e).lower() or "team_members_email_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
        raise e

def delete_team_member(db: Session, db_member: TeamMember) -> None:
    db.delete(db_member)
    db.commit()
