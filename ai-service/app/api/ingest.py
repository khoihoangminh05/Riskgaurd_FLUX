from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_service import RAGService

router = APIRouter()

class IngestFileRequest(BaseModel):
    file_path: str
    company_id: str
    document_id: str

@router.post("/ingest/file")
async def ingest_file(request: IngestFileRequest):
    try:
        # In a real scenario, we might download the file from S3 or receive it as UploadFile.
        # Here, assuming the file is accessible via file_path (shared volume).
        
        result = await RAGService.ingest_document(
            file_path=request.file_path,
            company_id=request.company_id,
            document_id=request.document_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
