from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from mock_mode import MOCK_MODE
from db.supabase_client import MOCK_USER, create_user, get_user, get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)
MOCK_JWT = "mock-pathforge-jwt"


class SignupRequest(BaseModel):
    email: str
    full_name: str = ""
    password: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str = ""


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _sign(payload: dict[str, Any]) -> str:
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body = _b64(json.dumps(payload).encode())
    secret = os.getenv("JWT_SECRET", "pathforge-dev-secret").encode()
    signature = _b64(hmac.new(secret, f"{header}.{body}".encode(), digestmod="sha256").digest())
    return f"{header}.{body}.{signature}"


def _verify(token: str) -> dict[str, Any]:
    try:
        header, body, signature = token.split(".")
        secret = os.getenv("JWT_SECRET", "pathforge-dev-secret").encode()
        expected = _b64(hmac.new(secret, f"{header}.{body}".encode(), digestmod="sha256").digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid token signature")
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


def make_token(user_id: str) -> str:
    return _sign({"sub": user_id, "iat": int(time.time()), "exp": int(time.time()) + 60 * 60 * 24 * 7})


async def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
    if MOCK_MODE:
        return MOCK_USER
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    payload = _verify(credentials.credentials)
    user = get_user(payload["sub"])
    if not user or user.get("error"):
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/signup")
async def signup(body: SignupRequest):
    if MOCK_MODE:
        return {"user": MOCK_USER, "access_token": MOCK_JWT, "token_type": "bearer"}
    user = create_user(body.email, body.full_name)
    if user.get("error"):
        raise HTTPException(status_code=400, detail=user["error"])
    return {"user": user, "access_token": make_token(user["id"]), "token_type": "bearer"}


@router.post("/login")
async def login(body: LoginRequest):
    if MOCK_MODE:
        return {"user": MOCK_USER, "access_token": MOCK_JWT, "token_type": "bearer"}
    try:
        supabase = get_supabase()
        if not supabase:
            raise HTTPException(status_code=500, detail="Database client is unavailable")
        result = supabase.table("users").select("*").eq("email", body.email).execute()
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid email or user not found")
        user = result.data[0]
        return {"user": user, "access_token": make_token(user["id"]), "token_type": "bearer"}
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        raise HTTPException(status_code=401, detail=str(exc))


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user
