from fastapi import FastAPI
from app.core.config import settings
from app.routers import api_router

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME}"}
