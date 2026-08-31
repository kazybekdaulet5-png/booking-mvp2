from collections import defaultdict
from typing import Optional

from sqlalchemy.orm import Session

from . import crud, models


def compute_overview(
    db: Session, date_from: Optional[str] = None, date_to: Optional[str] = None
) -> dict:
    """Считает агрегированную статистику по броням за период (или за всё время)."""
    bookings = crud.get_bookings_in_range(db, date_from, date_to)
    resources = {r.id: r for r in crud.get_resources(db)}

    total_bookings = len(bookings)
    confirmed = [b for b in bookings if b.status == "CONFIRMED"]
    pending = [b for b in bookings if b.status == "PENDING"]
    cancelled = [b for b in bookings if b.status == "CANCELLED"]

    total_revenue = round(sum(b.total_price for b in confirmed), 2)

    # выручка по дням (только подтверждённые брони)
    revenue_by_day: dict[str, float] = defaultdict(float)
    for b in confirmed:
        revenue_by_day[b.date] += b.total_price
    revenue_series = [
        {"date": d, "revenue": round(v, 2)} for d, v in sorted(revenue_by_day.items())
    ]

    # популярные ресурсы (по количеству броней, без учёта отменённых)
    resource_stats: dict[int, dict] = {}
    for b in bookings:
        if b.status == "CANCELLED":
            continue
        r = resources.get(b.resource_id)
        if not r:
            continue
        entry = resource_stats.setdefault(
            r.id, {"resource_id": r.id, "name": r.name, "category": r.category, "bookings_count": 0, "revenue": 0.0}
        )
        entry["bookings_count"] += 1
        if b.status == "CONFIRMED":
            entry["revenue"] += b.total_price

    popular_resources = sorted(
        resource_stats.values(), key=lambda x: x["bookings_count"], reverse=True
    )
    for r in popular_resources:
        r["revenue"] = round(r["revenue"], 2)

    # популярные временные слоты (по времени начала, без отменённых)
    slot_counts: dict[str, int] = defaultdict(int)
    for b in bookings:
        if b.status == "CANCELLED":
            continue
        slot_counts[b.start_time] += 1
    popular_slots = sorted(
        ({"start_time": t, "count": c} for t, c in slot_counts.items()),
        key=lambda x: x["count"],
        reverse=True,
    )

    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": len(confirmed),
        "pending_bookings": len(pending),
        "cancelled_bookings": len(cancelled),
        "total_revenue": total_revenue,
        "revenue_by_day": revenue_series,
        "popular_resources": popular_resources,
        "popular_slots": popular_slots,
    }
