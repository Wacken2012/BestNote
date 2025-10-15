from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/benutzer", tags=["benutzer"])

# In-Memory-Demo-Daten
users = [
    {"id": 1, "username": "admin", "role": "admin", "permissions": ["read", "write", "delete", "export", "import"]},
    {"id": 2, "username": "editor1", "role": "editor", "permissions": ["read", "write", "export"]},
    {"id": 3, "username": "user2", "role": "viewer", "permissions": ["read"]}
]

class UserModel(BaseModel):
    username: str
    role: str
    permissions: List[str]

class UserResponse(UserModel):
    id: int

@router.get("/", response_model=List[UserResponse])
async def list_users():
    return users

@router.post("/", response_model=UserResponse)
async def create_user(user: UserModel):
    new_id = max(u["id"] for u in users) + 1 if users else 1
    new_user = {"id": new_id, **user.dict()}
    users.append(new_user)
    return new_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserModel):
    for u in users:
        if u["id"] == user_id:
            u.update(user.dict())
            return u
    raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")

@router.delete("/{user_id}")
async def delete_user(user_id: int):
    global users
    users = [u for u in users if u["id"] != user_id]
    return {"message": f"Benutzer {user_id} gelöscht"}
