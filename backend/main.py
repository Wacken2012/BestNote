from fastapi import FastAPI
from fastapi import FastAPI, Request
import threading
from typing import Dict, Any
from datetime import datetime
from fastapi.responses import Response

app = FastAPI()

# Threadsafe In-Memory-Log für API-Zugriffe (aus routes_dashboard.py)
api_log = []
log_lock = threading.Lock()

# API-Log-Middleware für alle Requests
@app.middleware('http')
async def log_api_access(request: Request, call_next):
	response = await call_next(request)
	try:
		mandant = request.headers.get('X-Mandant') or 'unknown'
		endpoint = request.url.path
		status_code = response.status_code
		timestamp = datetime.utcnow().isoformat()
		entry = {
			'mandant': mandant,
			'endpoint': endpoint,
			'status_code': status_code,
			'timestamp': timestamp
		}
		with log_lock:
			api_log.append(entry)
	except Exception:
		pass
	return response

from backend.api.routes_mandant import router as mandant_router
from backend.api.routes_benutzer import router as benutzer_router
from backend.api.routes_workflow import router as workflow_router
from backend.api.routes_export import router as export_router
from backend.api.routes_import import router as import_router
from backend.api.routes_hardware import router as hardware_router
from backend.api.routes_health import router as health_router
from backend.api.routes_dashboard import router as dashboard_router
from backend.api.routes_calendar import router as calendar_router
from backend.auth import mandant_isolation_middleware

app = FastAPI(title="BestNote API")

# Middleware für Mandant-Isolation hinzufügen
app.middleware("http")(mandant_isolation_middleware)

# DEV-Bypass für Auth: setzt alle Requests als "authentifiziert" (nur für Entwicklung!)
import os
if os.environ.get("BESTNOTE_DEV_AUTH_BYPASS", "1") == "1":
	@app.middleware("http")
	async def dev_auth_bypass(request, call_next):
		# Simuliere einen gültigen Mandanten/Benutzer im Request-State
		request.state.user = "devuser"
		request.state.mandant = 1
		return await call_next(request)

app.include_router(mandant_router, prefix="/mandant", tags=["mandant"])
app.include_router(benutzer_router, prefix="/benutzer", tags=["benutzer"])
app.include_router(workflow_router, prefix="/workflow", tags=["workflow"])
app.include_router(export_router, prefix="/export", tags=["export"])
app.include_router(import_router, prefix="/import", tags=["import"])
app.include_router(hardware_router)
app.include_router(health_router)
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
app.include_router(calendar_router, tags=["calendar"])
from fastapi import FastAPI

from backend.api.routes_mandant import router as mandant_router
from backend.api.routes_workflow import router as workflow_router
from backend.api.routes_export import router as export_router
from backend.api.routes_import import router as import_router
from backend.api.routes_hardware import router as hardware_router
from backend.api.routes_health import router as health_router
from backend.api.routes_dashboard import router as dashboard_router
from backend.auth import mandant_isolation_middleware


# DEV-Bypass für Auth: setzt alle Requests als "authentifiziert" (nur für Entwicklung!)
import os
if os.environ.get("BESTNOTE_DEV_AUTH_BYPASS", "1") == "1":
	@app.middleware("http")
	async def dev_auth_bypass(request, call_next):
		# Simuliere einen gültigen Mandanten/Benutzer im Request-State
		request.state.user = "devuser"
		request.state.mandant = 1
		return await call_next(request)

# Middleware für Mandant-Isolation hinzufügen
app.middleware("http")(mandant_isolation_middleware)


app.include_router(mandant_router, prefix="/mandant", tags=["mandant"])
app.include_router(workflow_router, prefix="/workflow", tags=["workflow"])
app.include_router(export_router, prefix="/export", tags=["export"])
app.include_router(import_router, prefix="/import", tags=["import"])
app.include_router(hardware_router)
app.include_router(health_router)
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
