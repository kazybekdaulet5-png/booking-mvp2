from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import bookings, resources, stats
from .seed import seed_data

app = FastAPI(title="Booking MVP API", version="0.1.0")

# В проде замените "*" на конкретный домен фронтенда / Telegram WebApp
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    seed_data()


app.include_router(resources.router)
app.include_router(bookings.router)
app.include_router(stats.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "booking-mvp-api"}
