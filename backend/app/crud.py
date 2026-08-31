from typing import Optional

from sqlalchemy.orm import Session

from . import models, schemas


def time_to_minutes(t: str) -> int:
    h, m = t.split(":")
    return int(h) * 60 + int(m)


def get_resources(db: Session):
    return db.query(models.Resource).all()


def get_resource(db: Session, resource_id: int) -> Optional[models.Resource]:
    return db.query(models.Resource).filter(models.Resource.id == resource_id).first()


def get_bookings_by_date(db: Session, date: str):
    return (
        db.query(models.Booking)
        .filter(models.Booking.date == date)
        .order_by(models.Booking.start_time)
        .all()
    )


def has_overlap(
    db: Session,
    resource_id: int,
    date: str,
    start_time: str,
    end_time: str,
    exclude_booking_id: Optional[int] = None,
) -> bool:
    """Проверяет, пересекается ли новый интервал с уже существующими (не отменёнными) бронями того же ресурса."""
    new_start = time_to_minutes(start_time)
    new_end = time_to_minutes(end_time)

    query = db.query(models.Booking).filter(
        models.Booking.resource_id == resource_id,
        models.Booking.date == date,
        models.Booking.status != "CANCELLED",
    )
    if exclude_booking_id is not None:
        query = query.filter(models.Booking.id != exclude_booking_id)

    for existing in query.all():
        existing_start = time_to_minutes(existing.start_time)
        existing_end = time_to_minutes(existing.end_time)
        # интервалы пересекаются, если начало одного раньше конца другого в обе стороны
        if new_start < existing_end and existing_start < new_end:
            return True
    return False


def create_booking(
    db: Session, booking: schemas.BookingCreate, total_price: float
) -> models.Booking:
    db_booking = models.Booking(
        resource_id=booking.resource_id,
        client_name=booking.client_name,
        client_phone=booking.client_phone,
        date=booking.date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status="PENDING",
        total_price=total_price,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def update_booking_status(
    db: Session, booking_id: int, status: str
) -> Optional[models.Booking]:
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        return None
    db_booking.status = status
    db.commit()
    db.refresh(db_booking)
    return db_booking


def get_bookings_in_range(
    db: Session, date_from: Optional[str] = None, date_to: Optional[str] = None
):
    """Брони в диапазоне дат (включительно). Без дат — вся история."""
    query = db.query(models.Booking)
    if date_from:
        query = query.filter(models.Booking.date >= date_from)
    if date_to:
        query = query.filter(models.Booking.date <= date_to)
    return query.all()
