from .database import Base, SessionLocal, engine
from . import models


def seed_data():
    """Создаёт таблицы и заполняет демо-ресурсами, если БД пустая."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Resource).count() > 0:
            return
        resources = [
            models.Resource(name="PS5 Стандарт #1", category="PS5", price_per_hour=1500),
            models.Resource(name="PS5 Стандарт #2", category="PS5", price_per_hour=1500),
            models.Resource(name="PS5 V.I.P", category="PS5", price_per_hour=2500),
            models.Resource(name="Бильярдный стол #1", category="Бильярд", price_per_hour=2000),
            models.Resource(name="Бильярдный стол #2", category="Бильярд", price_per_hour=2000),
            models.Resource(name="Мастер Арман", category="Барбер", price_per_hour=5000),
            models.Resource(name="Мастер Дамир", category="Барбер", price_per_hour=4500),
        ]
        db.add_all(resources)
        db.commit()
    finally:
        db.close()
