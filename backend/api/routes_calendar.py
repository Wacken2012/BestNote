from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# --- SCHEMAS ---
class CalendarEvent(BaseModel):
    id: int
    mandant_id: int
    title: str
    description: Optional[str] = None
    start: str  # ISO8601
    end: str    # ISO8601
    location: Optional[str] = None
    all_day: bool = False

# --- IN-MEMORY STORE (nur für Entwicklung, später DB) ---
calendar_events: List[CalendarEvent] = []

# --- ENDPOINTS ---
@router.get("/calendar", response_model=List[CalendarEvent])
def get_events(mandant_id: Optional[int] = None):
    if mandant_id:
        return [e for e in calendar_events if e.mandant_id == mandant_id]
    return calendar_events

@router.get("/calendar/{event_id}", response_model=CalendarEvent)
def get_event(event_id: int):
    for e in calendar_events:
        if e.id == event_id:
            return e
    raise HTTPException(status_code=404, detail="Event not found")

@router.post("/calendar", response_model=CalendarEvent)
def create_event(event: CalendarEvent):
    if any(e.id == event.id for e in calendar_events):
        raise HTTPException(status_code=400, detail="ID already exists")
    calendar_events.append(event)
    return event

@router.put("/calendar/{event_id}", response_model=CalendarEvent)
def update_event(event_id: int, event: CalendarEvent):
    for idx, e in enumerate(calendar_events):
        if e.id == event_id:
            calendar_events[idx] = event
            return event
    raise HTTPException(status_code=404, detail="Event not found")

@router.delete("/calendar/{event_id}")
def delete_event(event_id: int):
    global calendar_events
    calendar_events = [e for e in calendar_events if e.id != event_id]
    return {"status": "deleted"}
