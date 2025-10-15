
import os
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import InvalidTokenError
from typing import Optional
from pydantic import BaseModel

# JWT-Konfiguration
JWT_SECRET = "your-secret-key"  # In Produktion aus Environment-Variable laden
JWT_ALGORITHM = "HS256"

class TokenData(BaseModel):
    mandant_id: int
    user_id: int
    username: str

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    """
    JWT-Token verifizieren und Token-Daten extrahieren
    DEV-Bypass: Wenn DEV_AUTH_BYPASS=1, immer Demo-Token zurückgeben
    """
    if os.environ.get("DEV_AUTH_BYPASS", "0") == "1":
        # Demo-Token für Entwicklung/Test
        return TokenData(mandant_id=1, user_id=1, username="devuser")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        mandant_id = payload.get("mandant_id")
        user_id = payload.get("user_id")
        username = payload.get("username")

        if mandant_id is None or user_id is None or username is None:
            raise HTTPException(status_code=401, detail="Token ungültig")

        return TokenData(mandant_id=mandant_id, user_id=user_id, username=username)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token abgelaufen")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token ungültig")

from fastapi import Request
from fastapi import Header
import os
from typing import Optional

def get_current_mandant(
    token_data: Optional[TokenData] = Depends(lambda: None),
    authorization: Optional[str] = Header(None)
) -> int:
    """
    Aktuelle Mandant-ID aus Token extrahieren
    DEV-Bypass: Wenn DEV_AUTH_BYPASS=1, immer Mandant 1 zurückgeben, auch ohne Auth-Header
    """
    if os.environ.get("DEV_AUTH_BYPASS", "0") == "1":
        return 1
    if token_data:
        return token_data.mandant_id
    # Fallback: Token aus Header extrahieren, falls vorhanden
    if authorization and authorization.startswith("Bearer "):
        try:
            import jwt
            payload = jwt.decode(authorization.split(" ")[1], JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload.get("mandant_id", 1)
        except Exception:
            raise HTTPException(status_code=401, detail="Token ungültig")
    raise HTTPException(status_code=401, detail="Nicht authentifiziert")

def create_access_token(data: dict) -> str:
    """
    JWT Access Token erstellen
    """
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

# Middleware für Mandant-Isolation
async def mandant_isolation_middleware(request: Request, call_next):
    """
    Middleware die sicherstellt, dass Mandant-spezifische Operationen
    nur auf den eigenen Mandanten zugreifen können
    """
    # Extrahiere Mandant-ID aus Pfad oder Query-Parametern
    path_params = request.path_params
    query_params = dict(request.query_params)

    requested_mandant_id = None

    # Prüfe Pfad-Parameter
    if "mandant_id" in path_params:
        requested_mandant_id = int(path_params["mandant_id"])
    elif "mandant_id" in query_params:
        requested_mandant_id = int(query_params["mandant_id"])

    # Wenn eine Mandant-ID angefordert wurde, prüfe Authentifizierung
    import os
    if requested_mandant_id is not None:
        if os.environ.get("DEV_AUTH_BYPASS", "0") == "1":
            # DEV-Bypass: Immer erlauben
            pass
        else:
            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Authentifizierung erforderlich")

            try:
                token = auth_header.split(" ")[1]
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                user_mandant_id = payload.get("mandant_id")

                if user_mandant_id != requested_mandant_id:
                    raise HTTPException(
                        status_code=403,
                        detail="Zugriff auf diesen Mandanten nicht erlaubt"
                    )
            except Exception:
                raise HTTPException(status_code=401, detail="Ungültiger Token")

    response = await call_next(request)
    return response