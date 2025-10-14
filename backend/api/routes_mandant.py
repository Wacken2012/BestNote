from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from backend.auth import verify_token, get_current_mandant, TokenData, create_access_token
from backend.models import Mandant

router = APIRouter()

# Pydantic-Modelle für API
class MandantCreate(BaseModel):
    name: str
    description: Optional[str] = None

class MandantResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    mandant_id: int
    user_id: int

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Benutzer anmelden und JWT-Token zurückgeben
    """
    # In einer realen Implementierung würde hier eine Datenbank-Abfrage stehen
    # zur Validierung der Credentials
    if login_data.username == "admin" and login_data.password == "password":
        # Beispiel-Token für Mandant 1, User 1
        token_data = {
            "mandant_id": 1,
            "user_id": 1,
            "username": login_data.username
        }
        access_token = create_access_token(token_data)
        return LoginResponse(
            access_token=access_token,
            mandant_id=1,
            user_id=1
        )
    elif login_data.username == "user2" and login_data.password == "password":
        # Beispiel-Token für Mandant 2, User 2
        token_data = {
            "mandant_id": 2,
            "user_id": 2,
            "username": login_data.username
        }
        access_token = create_access_token(token_data)
        return LoginResponse(
            access_token=access_token,
            mandant_id=2,
            user_id=2
        )
    else:
        raise HTTPException(status_code=401, detail="Ungültige Credentials")

@router.get("/", response_model=List[MandantResponse])
async def get_mandanten(current_mandant: int = Depends(get_current_mandant)):
    """
    Liste aller Mandanten - nur für Admin-Benutzer
    """
    # In einer realen Implementierung würde hier eine Datenbank-Abfrage stehen
    # und nur Admin-Benutzer hätten Zugriff
    return [
        MandantResponse(id=1, name="Beispiel Mandant 1", description="Test"),
        MandantResponse(id=2, name="Beispiel Mandant 2", description="Test 2")
    ]

@router.post("/", response_model=MandantResponse)
async def create_mandant(
    mandant_data: MandantCreate,
    token_data: TokenData = Depends(verify_token)
):
    """
    Neuen Mandanten erstellen - nur für Admin-Benutzer
    """
    # In einer realen Implementierung würde hier eine Datenbank-Operation stehen
    # und nur Admin-Benutzer könnten Mandanten erstellen
    new_mandant = MandantResponse(
        id=999,  # In DB generierte ID
        name=mandant_data.name,
        description=mandant_data.description
    )
    return new_mandant

@router.get("/{mandant_id}", response_model=MandantResponse)
async def get_mandant(
    mandant_id: int,
    current_mandant: int = Depends(get_current_mandant)
):
    """
    Einzelnen Mandanten abrufen - nur eigenen Mandanten oder Admin
    """
    # Mandant-Isolation: Stelle sicher, dass nur der eigene Mandant abgerufen werden kann
    if current_mandant != mandant_id:
        raise HTTPException(
            status_code=403,
            detail="Zugriff auf diesen Mandanten nicht erlaubt"
        )

    # In einer realen Implementierung würde hier eine Datenbank-Abfrage stehen
    return MandantResponse(
        id=mandant_id,
        name=f"Mandant {mandant_id}",
        description=f"Beschreibung für Mandant {mandant_id}"
    )

@router.put("/{mandant_id}", response_model=MandantResponse)
async def update_mandant(
    mandant_id: int,
    mandant_data: MandantCreate,
    current_mandant: int = Depends(get_current_mandant)
):
    """
    Mandanten aktualisieren - nur eigenen Mandanten
    """
    if current_mandant != mandant_id:
        raise HTTPException(
            status_code=403,
            detail="Zugriff auf diesen Mandanten nicht erlaubt"
        )

    # In einer realen Implementierung würde hier ein Datenbank-Update stehen
    return MandantResponse(
        id=mandant_id,
        name=mandant_data.name,
        description=mandant_data.description
    )

@router.delete("/{mandant_id}")
async def delete_mandant(
    mandant_id: int,
    current_mandant: int = Depends(get_current_mandant)
):
    """
    Mandanten löschen - nur eigenen Mandanten und nur von Admin
    """
    if current_mandant != mandant_id:
        raise HTTPException(
            status_code=403,
            detail="Zugriff auf diesen Mandanten nicht erlaubt"
        )

    # In einer realen Implementierung würde hier ein Datenbank-Delete stehen
    return {"message": f"Mandant {mandant_id} wurde gelöscht"}