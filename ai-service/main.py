from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.analysis import router as analysis_router
from app.api.analysis import router as analysis_router
from app.api.ingest import router as ingest_router
from app.api.query import router as query_router

settings = get_settings()

app = FastAPI(title="RiskGuard AI Service")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router, prefix="/api/v1", tags=["analysis"])
app.include_router(ingest_router, prefix="/api/v1", tags=["ingest"])
app.include_router(query_router, prefix="/api/v1", tags=["query"])

@app.get("/")
def read_root():
    return {"message": "RiskGuard AI Service is running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "google_api_configured": bool(settings.GOOGLE_API_KEY)}
