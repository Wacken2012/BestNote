from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import threading
from pydantic import BaseModel
import csv
from fastapi.responses import StreamingResponse
from io import StringIO

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Mock-Daten für Demo-Zwecke
mock_dashboard_data = {
    1: {  # mandant_id
        'total_scores': 150,
        'total_parts': 450,
        'recent_uploads': 12,
        'missing_parts': 23,
        'upcoming_events': 5,
        'active_users': 8,
        'storage_used': '2.4 GB',
        'last_backup': '2024-01-15T08:00:00'
    }
}

# Threadsafe In-Memory-Log für API-Zugriffe
api_log: List[Dict[str, Any]] = []
log_lock = threading.Lock()

class ApiLogEntry(BaseModel):
    mandant: int
    endpoint: str
    status_code: int
    timestamp: str


@router.get("/{mandant_id}")
async def get_dashboard_data(mandant_id: int) -> Dict[str, Any]:
    """Gibt aggregierte Dashboard-Daten für einen Mandanten zurück"""
    if mandant_id not in mock_dashboard_data:
        # Für Demo-Zwecke erstellen wir Daten für jeden Mandanten
        mock_dashboard_data[mandant_id] = {
            'total_scores': 75 + (mandant_id * 10),
            'total_parts': 225 + (mandant_id * 30),
            'recent_uploads': 6 + (mandant_id % 10),
            'missing_parts': 12 + (mandant_id % 15),
            'upcoming_events': 3 + (mandant_id % 5),
            'active_users': 4 + (mandant_id % 8),
            'storage_used': f'{1.2 + (mandant_id * 0.3):.1f} GB',
            'last_backup': (datetime.now() - timedelta(days=mandant_id % 7)).isoformat()
        }

    data = mock_dashboard_data[mandant_id]

    # Berechne zusätzliche Metriken
    data['completion_rate'] = ((data['total_parts'] - data['missing_parts']) / data['total_parts']) * 100 if data['total_parts'] > 0 else 0
    data['avg_parts_per_score'] = data['total_parts'] / data['total_scores'] if data['total_scores'] > 0 else 0

    return {
        'mandant_id': mandant_id,
        'timestamp': datetime.now().isoformat(),
        'data': data
    }

@router.get("/{mandant_id}/missing-parts")
async def get_missing_parts(mandant_id: int) -> List[Dict[str, Any]]:
    """Gibt Liste der fehlenden Stimmen zurück"""
    # Mock-Daten für fehlende Stimmen
    missing_parts = [
        {
            'score_id': 1,
            'score_title': 'Beethoven - Symphonie Nr. 5',
            'missing_parts': ['Violine 1', 'Violine 2'],
            'priority': 'high'
        },
        {
            'score_id': 2,
            'score_title': 'Mozart - Zauberflöte',
            'missing_parts': ['Klarinette'],
            'priority': 'medium'
        },
        {
            'score_id': 3,
            'score_title': 'Bach - Brandenburgisches Konzert Nr. 3',
            'missing_parts': ['Trompete', 'Pauke'],
            'priority': 'low'
        }
    ]

    return missing_parts[:5]  # Begrenze auf 5 Einträge

@router.get("/{mandant_id}/recent-activity")
async def get_recent_activity(mandant_id: int) -> List[Dict[str, Any]]:
    """Gibt letzte Aktivitäten zurück"""
    activities = [
        {
            'type': 'upload',
            'description': 'Neue Note hochgeladen: Beethoven - Mondscheinsonate',
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
            'user': 'Anna Müller'
        },
        {
            'type': 'event',
            'description': 'Probe am 20.01.2024 bestätigt',
            'timestamp': (datetime.now() - timedelta(hours=4)).isoformat(),
            'user': 'Thomas Schmidt'
        },
        {
            'type': 'export',
            'description': 'ZIP-Export erstellt (Standard-Layout)',
            'timestamp': (datetime.now() - timedelta(hours=6)).isoformat(),
            'user': 'Lisa Wagner'
        },
        {
            'type': 'backup',
            'description': 'Automatisches Backup erfolgreich',
            'timestamp': (datetime.now() - timedelta(hours=24)).isoformat(),
            'user': 'System'
        }
    ]

    return activities

@router.get("/{mandant_id}/storage-stats")
async def get_storage_stats(mandant_id: int) -> Dict[str, Any]:
    """Gibt Speicherstatistiken zurück"""
    return {
        'total_used': '2.4 GB',
        'total_available': '10 GB',
        'usage_percentage': 24,
        'files_by_type': {
            'PDF': 145,
            'MIDI': 23,
            'XML': 12,
            'Other': 8
        },
        'largest_files': [
            {'name': 'Beethoven_Symphonie_9.pdf', 'size': '45 MB'},
            {'name': 'Wagner_Ring_Zyklus.zip', 'size': '120 MB'},
            {'name': 'Bach_Kantaten_Sammlung.pdf', 'size': '78 MB'}
        ]
    }

@router.get("/{mandant_id}/performance-metrics")
async def get_performance_metrics(mandant_id: int) -> Dict[str, Any]:
    """Gibt Performance-Metriken zurück"""
    return {
        'avg_response_time': '245ms',
        'uptime_percentage': 99.8,
        'active_sessions': 12,
        'api_calls_today': 1247,
        'error_rate': 0.02,
        'cache_hit_rate': 87.5
    }

@router.get("/api-log", response_model=List[ApiLogEntry])
async def get_api_log(
    mandant: Optional[int] = None,
    endpoint: Optional[str] = None,
    status_code: Optional[int] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None
):
    """Gefilterte API-Log-Übersicht"""
    with log_lock:
        filtered = [entry for entry in api_log
                    if (not mandant or str(entry['mandant']) == str(mandant))
                    and (not endpoint or endpoint in entry['endpoint'])
                    and (not status_code or entry['status_code'] == status_code)
                    and (not from_date or entry['timestamp'] >= from_date)
                    and (not to_date or entry['timestamp'] <= to_date)]
    return filtered

@router.get("/api-log/export")
async def export_api_log(
    mandant: Optional[int] = None,
    endpoint: Optional[str] = None,
    status_code: Optional[int] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None
):
    """Exportiert das API-Log als CSV"""
    with log_lock:
        filtered = [entry for entry in api_log
                    if (not mandant or str(entry['mandant']) == str(mandant))
                    and (not endpoint or endpoint in entry['endpoint'])
                    and (not status_code or entry['status_code'] == status_code)
                    and (not from_date or entry['timestamp'] >= from_date)
                    and (not to_date or entry['timestamp'] <= to_date)]

    si = StringIO()
    writer = csv.DictWriter(si, fieldnames=['mandant', 'endpoint', 'status_code', 'timestamp'])
    writer.writeheader()
    writer.writerows(filtered)
    si.seek(0)
    return StreamingResponse(si, media_type='text/csv', headers={'Content-Disposition': 'attachment; filename="api_dashboard.csv"'})