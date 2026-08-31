from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import schemas, stats
from ..database import get_db

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/overview", response_model=schemas.StatsOverview)
def stats_overview(
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD, включительно"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD, включительно"),
    db: Session = Depends(get_db),
):
    """Сводная статистика: брони, выручка, популярные ресурсы и слоты."""
    return stats.compute_overview(db, date_from, date_to)
