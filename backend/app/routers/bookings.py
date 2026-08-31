from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..crud import time_to_minutes
from ..database import get_db

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.get("", response_model=List[schemas.BookingOut])
def list_bookings(
    date: str = Query(..., description="Дата в формате YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """Брони на конкретную дату."""
    return crud.get_bookings_by_date(db, date)


@router.post("", response_model=schemas.BookingOut, status_code=201)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    """Создать новую бронь. Проверяет, что ресурс существует и время не занято."""
    resource = crud.get_resource(db, booking.resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Ресурс не найден")

    start_min = time_to_minutes(booking.start_time)
    end_min = time_to_minutes(booking.end_time)
    if end_min <= start_min:
        raise HTTPException(
            status_code=400, detail="Время окончания должно быть позже времени начала"
        )

    if crud.has_overlap(db, booking.resource_id, booking.date, booking.start_time, booking.end_time):
        raise HTTPException(status_code=409, detail="Это время уже занято")

    duration_hours = (end_min - start_min) / 60
    total_price = round(duration_hours * resource.price_per_hour, 2)

    return crud.create_booking(db, booking, total_price)


@router.patch("/{booking_id}/status", response_model=schemas.BookingOut)
def update_status(
    booking_id: int, payload: schemas.BookingStatusUpdate, db: Session = Depends(get_db)
):
    """Обновить статус брони (PENDING / CONFIRMED / CANCELLED)."""
    booking = crud.update_booking_status(db, booking_id, payload.status)
    if not booking:
        raise HTTPException(status_code=404, detail="Бронь не найдена")
    return booking
