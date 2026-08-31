from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


class Resource(Base):
    """Ресурс, который можно забронировать: стол, приставка, мастер и т.д."""

    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)          # напр. "PS5 V.I.P", "Мастер Арман"
    category = Column(String, nullable=False, index=True)  # напр. "PS5", "Бильярд", "Барбер"
    price_per_hour = Column(Float, nullable=False)

    bookings = relationship(
        "Booking", back_populates="resource", cascade="all, delete-orphan"
    )


class Booking(Base):
    """Бронь конкретного ресурса на дату и временной интервал."""

    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    client_name = Column(String, nullable=False)
    client_phone = Column(String, nullable=False)
    date = Column(String, nullable=False, index=True)   # формат YYYY-MM-DD
    start_time = Column(String, nullable=False)          # формат HH:MM
    end_time = Column(String, nullable=False)             # формат HH:MM
    status = Column(String, nullable=False, default="PENDING")  # PENDING | CONFIRMED | CANCELLED
    total_price = Column(Float, nullable=False)

    resource = relationship("Resource", back_populates="bookings")
