import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator

TIME_RE = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ALLOWED_STATUSES = {"PENDING", "CONFIRMED", "CANCELLED"}


# ---------- Resource ----------

class ResourceBase(BaseModel):
    name: str
    category: str
    price_per_hour: float


class ResourceCreate(ResourceBase):
    pass


class ResourceOut(ResourceBase):
    id: int

    class Config:
        from_attributes = True


# ---------- Booking ----------

class BookingBase(BaseModel):
    resource_id: int
    client_name: str = Field(..., min_length=1, max_length=100)
    client_phone: str = Field(..., min_length=5, max_length=30)
    date: str
    start_time: str
    end_time: str

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        if not DATE_RE.match(v):
            raise ValueError("date должен быть в формате YYYY-MM-DD")
        return v

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_time(cls, v: str) -> str:
        if not TIME_RE.match(v):
            raise ValueError("время должно быть в формате HH:MM")
        return v


class BookingCreate(BookingBase):
    pass


class BookingStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ALLOWED_STATUSES:
            raise ValueError(f"status должен быть одним из {ALLOWED_STATUSES}")
        return v


class BookingOut(BookingBase):
    id: int
    status: str
    total_price: float
    resource: Optional[ResourceOut] = None

    class Config:
        from_attributes = True


# ---------- Stats ----------

class RevenueByDay(BaseModel):
    date: str
    revenue: float


class PopularResource(BaseModel):
    resource_id: int
    name: str
    category: str
    bookings_count: int
    revenue: float


class PopularSlot(BaseModel):
    start_time: str
    count: int


class StatsOverview(BaseModel):
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    cancelled_bookings: int
    total_revenue: float
    revenue_by_day: list[RevenueByDay]
    popular_resources: list[PopularResource]
    popular_slots: list[PopularSlot]
