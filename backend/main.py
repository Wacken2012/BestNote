from fastapi import FastAPI
from backend.api.routes_mandant import router as mandant_router
from backend.api.routes_workflow import router as workflow_router
from backend.api.routes_export import router as export_router
from backend.api.routes_import import router as import_router
from backend.api.routes_hardware import router as hardware_router
from backend.api.routes_health import router as health_router
from backend.auth import mandant_isolation_middleware

app = FastAPI(title="BestNote API")

# Middleware für Mandant-Isolation hinzufügen
app.middleware("http")(mandant_isolation_middleware)

app.include_router(mandant_router, prefix="/mandant", tags=["mandant"])
app.include_router(workflow_router, prefix="/workflow", tags=["workflow"])
app.include_router(export_router, prefix="/export", tags=["export"])
app.include_router(import_router, prefix="/import", tags=["import"])
app.include_router(hardware_router)
app.include_router(health_router)
