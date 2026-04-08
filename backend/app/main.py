from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine, SessionLocal
from app.routers import auth, workouts, nutrition, dashboard, social
from app.seed import run_seeds

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GymSite API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(nutrition.router)
app.include_router(dashboard.router)
app.include_router(social.router)


@app.on_event("startup")
def startup():
    db = SessionLocal()
    try:
        run_seeds(db)
    finally:
        db.close()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
