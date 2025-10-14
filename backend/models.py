from pydantic import BaseModel
from typing import List, Optional

class Score(BaseModel):
    id: Optional[int] = None
    title: str
    composer: str
    year: Optional[str] = None
    metadata: Optional[str] = None

class Part(BaseModel):
    id: Optional[int] = None
    score_id: int
    name: str

class PartFile(BaseModel):
    id: Optional[int] = None
    part_id: int
    file_path: str
    file_type: Optional[str] = None

class Mandant(BaseModel):
    id: Optional[int] = None
    name: str
    domain: Optional[str] = None
    created_at: Optional[str] = None
    is_active: bool = True

class Branding(BaseModel):
    mandant_id: int
    logo_url: Optional[str] = None
    primary_color: str = "#007bff"
    secondary_color: str = "#6c757d"
    font_family: str = "Arial, sans-serif"

class OnboardingStatus(BaseModel):
    mandant_id: int
    step: int = 1  # 1: Welcome, 2: Basic Info, 3: Branding, 4: Import Data, 5: Complete
    completed_steps: List[int] = []
    is_completed: bool = False

class Termin(BaseModel):
    id: Optional[int] = None
    mandant_id: int
    title: str
    description: Optional[str] = None
    date: str  # ISO format: YYYY-MM-DD
    time: Optional[str] = None  # HH:MM format
    location: Optional[str] = None
    event_type: str  # 'probe', 'auftritt', 'versammlung', 'other'
    created_by: int  # user_id
    is_all_day: bool = False

class Teilnahme(BaseModel):
    id: Optional[int] = None
    termin_id: int
    user_id: int
    status: str  # 'accepted', 'declined', 'pending'
    comment: Optional[str] = None
    responded_at: Optional[str] = None

class APIToken(BaseModel):
    id: Optional[int] = None
    mandant_id: int
    name: str
    token: str
    created_at: str
    expires_at: Optional[str] = None
    is_active: bool = True
    permissions: List[str] = []  # ['read', 'write', 'admin']
    last_used: Optional[str] = None
    usage_count: int = 0

class APILog(BaseModel):
    id: Optional[int] = None
    mandant_id: int
    token_id: Optional[int] = None
    endpoint: str
    method: str
    status_code: int
    response_time: float  # in milliseconds
    ip_address: str
    user_agent: Optional[str] = None
    timestamp: str
    error_message: Optional[str] = None