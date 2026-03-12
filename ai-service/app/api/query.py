from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.risk_analyst import risk_analyst_agent

router = APIRouter()

class InternalQueryRequest(BaseModel):
    company_id: str
    query: str

@router.post("/analyze/internal-query")
async def analyze_internal_query(request: InternalQueryRequest):
    try:
        print(request.company_id + " " + request.query)
        result = await risk_analyst_agent.answer_query(
            company_id=request.company_id,
            query=request.query
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
