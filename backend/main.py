from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .auth import router as auth_router
from .bots import router as bots_router
from .database import init_db

app = FastAPI(title="lrrhub")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(auth_router)
app.include_router(bots_router)
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
