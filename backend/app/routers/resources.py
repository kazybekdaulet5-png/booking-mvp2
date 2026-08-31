from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("", response_model=List[schemas.ResourceOut])
def list_resources(db: Session = Depends(get_db)):
    """Список всех ресурсов (столов/приставок/мастеров)."""
    return crud.get_resources(db)
