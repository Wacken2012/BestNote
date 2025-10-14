from .routes_mandant import router as routes_mandant
from .routes_workflow import router as routes_workflow

# Legacy router for backward compatibility
from fastapi import APIRouter

router = APIRouter()

@router.get("/scores")
async def get_scores():
    # Placeholder for getting scores
    return {"scores": []}

@router.post("/scores")
async def create_score(score: dict):
    # Placeholder for creating score
    return {"message": "Score created"}