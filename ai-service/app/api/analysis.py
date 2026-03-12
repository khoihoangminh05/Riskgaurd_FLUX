from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.news_agent import news_agent

router = APIRouter()

from typing import Dict, Any, Optional

class RiskProfile(BaseModel):
    keywords: list[str] = []
    competitors: list[str] = []
    threshold: int = 50

class AnalyzeRequest(BaseModel):
    ticker: str
    company_name: str
    company_id: str
    risk_profile: Optional[RiskProfile] = None

@router.post("/analyze/news")
async def analyze_news(request: AnalyzeRequest):
    try:
        initial_state = {
            "company_name": request.company_name,
            "company_id": request.company_id,
            "risk_profile": request.risk_profile.model_dump() if request.risk_profile else {},
            "internal_context": [],
            "urls": [],
            "articles": [],
            "analysis": {}
        }
        # Invoke the LangGraph agent
        result = await news_agent.ainvoke(initial_state)
        
        # Return the analysis result directly
        return result["analysis"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
