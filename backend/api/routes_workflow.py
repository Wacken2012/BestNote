from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_workflows():
    """Liste aller Workflows"""
    return {"workflows": []}

@router.post("/")
async def create_workflow(workflow: dict):
    """Neuen Workflow erstellen"""
    return {"message": "Workflow created", "id": 1}

@router.get("/{workflow_id}")
async def get_workflow(workflow_id: int):
    """Einzelnen Workflow abrufen"""
    return {"workflow_id": workflow_id, "name": "Beispiel Workflow"}