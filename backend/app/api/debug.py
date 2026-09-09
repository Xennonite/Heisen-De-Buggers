from fastapi import APIRouter, Depends
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/debug-token")
def debug_token(user: dict = Depends(get_current_user)):
    return user
