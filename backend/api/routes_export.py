from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Optional
from pydantic import BaseModel
from backend.auth import get_current_mandant
from backend.services.export import ExportService

router = APIRouter()
export_service = ExportService()

# Pydantic-Modelle für API
class ExportRequest(BaseModel):
    layout: str = 'standard'
    include_pdfs: bool = True
    include_metadata: bool = True

class ExportResponse(BaseModel):
    export_id: str
    filename: str
    download_url: str
    status: str

class LayoutInfo(BaseModel):
    name: str
    description: str

class ExportHistoryItem(BaseModel):
    id: int
    date: str
    layout: str
    file_size: str
    status: str

@router.get("/layouts", response_model=Dict[str, LayoutInfo])
async def get_export_layouts(current_mandant: int = Depends(get_current_mandant)):
    """Verfügbare Export-Layouts abrufen"""
    return {
        'standard': {
            'name': 'Standard-Layout',
            'description': 'Klassisches Notenlayout mit Titelseite'
        },
        'compact': {
            'name': 'Kompakt-Layout',
            'description': 'Platzsparendes Layout ohne Titelseite'
        },
        'digital': {
            'name': 'Digital-Optimiert',
            'description': 'Für Bildschirmdarstellung optimiert'
        }
    }

@router.post("/", response_model=ExportResponse)
async def create_export(
    request: ExportRequest,
    current_mandant: int = Depends(get_current_mandant)
):
    """Neuen Export erstellen"""
    try:
        result = export_service.create_export_zip(
            mandant_id=current_mandant,
            layout=request.layout,
            include_pdfs=request.include_pdfs,
            include_metadata=request.include_metadata
        )

        return {
            'export_id': f'export_{current_mandant}_{request.layout}',
            'filename': result,
            'download_url': f'/exports/{result}',
            'status': 'completed'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export-Fehler: {str(e)}")

@router.get("/history", response_model=List[ExportHistoryItem])
async def get_export_history(current_mandant: int = Depends(get_current_mandant)):
    """Export-Historie abrufen"""
    # In einer realen Implementierung würde hier die Datenbank abgefragt
    return [
        {
            'id': 1,
            'date': '2024-01-15T10:30:00',
            'layout': 'standard',
            'file_size': '2.5 MB',
            'status': 'completed'
        },
        {
            'id': 2,
            'date': '2024-01-10T14:20:00',
            'layout': 'compact',
            'file_size': '1.8 MB',
            'status': 'completed'
        }
    ]