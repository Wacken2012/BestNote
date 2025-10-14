from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List, Dict, Optional
from pydantic import BaseModel
from backend.auth import get_current_mandant
from backend.services.import_softnote import SoftNoteImportService

router = APIRouter()
import_service = SoftNoteImportService()

# Pydantic-Modelle für API
class ImportPreviewResponse(BaseModel):
    works: List[Dict]
    parts: List[Dict]
    warnings: List[str]

class CalendarEvent(BaseModel):
    id: int
    title: str
    date: str
    type: str  # 'performance', 'probe', 'assembly'
    location: Optional[str] = None
    description: Optional[str] = None

@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_import(
    file: UploadFile = File(...),
    current_mandant: int = Depends(get_current_mandant)
):
    """Vorschau für Import-Datei generieren"""
    try:
        content = await file.read()
        filename = file.filename

        if filename.endswith('.csv'):
            result = import_service.preview_csv_import(content.decode('utf-8'))
        elif filename.endswith('.zip'):
            result = import_service.preview_zip_import(content)
        else:
            raise HTTPException(status_code=400, detail="Nicht unterstütztes Dateiformat")

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import-Vorschau-Fehler: {str(e)}")

@router.post("/")
async def execute_import(
    file: UploadFile = File(...),
    current_mandant: int = Depends(get_current_mandant)
):
    """Import ausführen"""
    try:
        content = await file.read()
        filename = file.filename

        if filename.endswith('.csv'):
            result = import_service.import_csv(content.decode('utf-8'), current_mandant)
        elif filename.endswith('.zip'):
            result = import_service.import_zip(content, current_mandant)
        else:
            raise HTTPException(status_code=400, detail="Nicht unterstütztes Dateiformat")

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import-Fehler: {str(e)}")

@router.get("/calendar", response_model=List[CalendarEvent])
async def get_calendar_events(current_mandant: int = Depends(get_current_mandant)):
    """Kalender-Events abrufen"""
    # In einer realen Implementierung würde hier die Datenbank abgefragt
    return [
        {
            'id': 1,
            'title': 'Probe Chor',
            'date': '2024-01-20',
            'type': 'probe',
            'location': 'Kirche St. Marien',
            'description': 'Wöchentliche Chorprobe'
        },
        {
            'id': 2,
            'title': 'Kirchenkonzert',
            'date': '2024-01-25',
            'type': 'performance',
            'location': 'Stadthalle',
            'description': 'Jahreskonzert mit Orchester'
        },
        {
            'id': 3,
            'title': 'Mitgliederversammlung',
            'date': '2024-02-01',
            'type': 'assembly',
            'location': 'Gemeindehaus',
            'description': 'Jahreshauptversammlung'
        }
    ]