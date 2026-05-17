from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api import attempts, auth, profile, question_sets
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
import os
load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(profile.router, prefix=settings.api_prefix)
app.include_router(question_sets.router, prefix=settings.api_prefix)
app.include_router(attempts.router, prefix=settings.api_prefix)

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")
print(OLLAMA_MODEL)
@app.get("/")
def root():
    return {"message": settings.app_name, "status": "ok"}
