import json
import os
import re
import secrets
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Any

import asyncpg
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Cookie, Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


DATABASE_URL = os.environ.get("DATABASE_URL", "")
SESSION_SECRET = os.environ.get("SESSION_SECRET", "")
REGISTRATION_CODE = os.environ.get("REGISTRATION_CODE", "")
COOKIE_NAME = "whit_chess_session"
COOKIE_DOMAIN = os.environ.get("COOKIE_DOMAIN") or None
SESSION_DAYS = int(os.environ.get("SESSION_DAYS", "14"))
ALLOWED_ORIGINS = [item.strip() for item in os.environ.get("ALLOWED_ORIGINS", "http://localhost:8080").split(",") if item.strip()]
USERNAME_RE = re.compile(r"^[A-Za-z0-9_-]{3,24}$")
PIN_RE = re.compile(r"^[0-9]{6}$")
password_hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=2)
login_attempts: dict[str, list[float]] = {}


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=24)
    pin: str = Field(min_length=6, max_length=6)


class Registration(Credentials):
    inviteCode: str = Field(min_length=4, max_length=128)


class ProgressPayload(BaseModel):
    xp: int = Field(default=0, ge=0, le=10_000_000)
    lessons: list[int] = Field(default_factory=list)
    puzzles: list[int] = Field(default_factory=list)
    streak: int = Field(default=1, ge=0, le=100_000)
    lastVisit: str | None = None
    soundEnabled: bool = True
    skills: dict[str, Any] = Field(default_factory=dict)
    updatedAt: str | None = None


def default_progress() -> dict[str, Any]:
    return ProgressPayload().model_dump()


def validate_credentials(username: str, pin: str) -> tuple[str, str]:
    clean_username = username.strip()
    if not USERNAME_RE.fullmatch(clean_username):
        raise HTTPException(status_code=400, detail="Username must be 3–24 letters, numbers, dashes, or underscores.")
    if not PIN_RE.fullmatch(pin):
        raise HTTPException(status_code=400, detail="PIN must contain exactly six numbers.")
    return clean_username, clean_username.lower()


def issue_token(user_id: str, username: str) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode({"sub": user_id, "username": username, "iat": now, "exp": now + timedelta(days=SESSION_DAYS)}, SESSION_SECRET, algorithm="HS256")


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=SESSION_DAYS * 86400,
        httponly=True,
        secure=True,
        samesite="lax",
        domain=COOKIE_DOMAIN,
        path="/",
    )


def rate_limit_key(request: Request, username: str) -> str:
    forwarded = request.headers.get("cf-connecting-ip") or request.headers.get("x-forwarded-for", "")
    address = forwarded.split(",")[0].strip() or (request.client.host if request.client else "unknown")
    return f"{address}:{username.lower()}"


def check_login_rate(request: Request, username: str) -> str:
    key = rate_limit_key(request, username)
    cutoff = time.time() - 600
    login_attempts[key] = [attempt for attempt in login_attempts.get(key, []) if attempt > cutoff]
    if len(login_attempts[key]) >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Wait ten minutes and try again.")
    return key


async def current_user(request: Request, token: str | None = Cookie(default=None, alias=COOKIE_NAME)) -> asyncpg.Record:
    if not token:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    try:
        payload = jwt.decode(token, SESSION_SECRET, algorithms=["HS256"])
        user_id = uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(status_code=401, detail="Your session has expired. Please sign in again.") from None
    user = await request.app.state.pool.fetchrow("SELECT id, username FROM players WHERE id = $1", user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Player account not found.")
    return user


async def player_bundle(pool: asyncpg.Pool, user: asyncpg.Record) -> dict[str, Any]:
    row = await pool.fetchrow("SELECT data FROM player_progress WHERE player_id = $1", user["id"])
    progress = dict(row["data"]) if row else default_progress()
    return {"player": {"id": str(user["id"]), "username": user["username"]}, "progress": progress}


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not DATABASE_URL or len(SESSION_SECRET) < 32 or not REGISTRATION_CODE:
        raise RuntimeError("DATABASE_URL, a 32+ character SESSION_SECRET, and REGISTRATION_CODE are required")
    app.state.pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)
    async with app.state.pool.acquire() as connection:
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS players (
                id UUID PRIMARY KEY,
                username VARCHAR(24) NOT NULL,
                username_key VARCHAR(24) NOT NULL UNIQUE,
                pin_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_login_at TIMESTAMPTZ
            )
        """)
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS player_progress (
                player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
                data JSONB NOT NULL DEFAULT '{}'::jsonb,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
    yield
    await app.state.pool.close()


app = FastAPI(title="Whit the Chess API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
async def health(request: Request):
    await request.app.state.pool.fetchval("SELECT 1")
    return {"status": "ok"}


@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def register(payload: Registration, request: Request, response: Response):
    username, username_key = validate_credentials(payload.username, payload.pin)
    if not secrets.compare_digest(payload.inviteCode, REGISTRATION_CODE):
        raise HTTPException(status_code=403, detail="That invitation code is not valid.")
    player_id = uuid.uuid4()
    pin_hash = password_hasher.hash(payload.pin)
    try:
        async with request.app.state.pool.acquire() as connection, connection.transaction():
            user = await connection.fetchrow(
                "INSERT INTO players (id, username, username_key, pin_hash) VALUES ($1, $2, $3, $4) RETURNING id, username",
                player_id, username, username_key, pin_hash,
            )
            await connection.execute(
                "INSERT INTO player_progress (player_id, data) VALUES ($1, $2::jsonb)",
                player_id, json.dumps(default_progress()),
            )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=409, detail="That username is already taken.") from None
    set_session_cookie(response, issue_token(str(user["id"]), user["username"]))
    return await player_bundle(request.app.state.pool, user)


@app.post("/auth/login")
async def login(payload: Credentials, request: Request, response: Response):
    _, username_key = validate_credentials(payload.username, payload.pin)
    key = check_login_rate(request, payload.username)
    user = await request.app.state.pool.fetchrow(
        "SELECT id, username, pin_hash FROM players WHERE username_key = $1", username_key
    )
    valid = False
    if user:
        try:
            valid = password_hasher.verify(user["pin_hash"], payload.pin)
        except VerifyMismatchError:
            valid = False
    if not valid:
        login_attempts.setdefault(key, []).append(time.time())
        raise HTTPException(status_code=401, detail="Username or PIN is incorrect.")
    login_attempts.pop(key, None)
    await request.app.state.pool.execute("UPDATE players SET last_login_at = NOW() WHERE id = $1", user["id"])
    set_session_cookie(response, issue_token(str(user["id"]), user["username"]))
    return await player_bundle(request.app.state.pool, user)


@app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, domain=COOKIE_DOMAIN, path="/")


@app.get("/api/me")
async def me(request: Request, user: asyncpg.Record = Depends(current_user)):
    return await player_bundle(request.app.state.pool, user)


@app.get("/api/progress")
async def get_progress(request: Request, user: asyncpg.Record = Depends(current_user)):
    return await player_bundle(request.app.state.pool, user)


@app.put("/api/progress")
async def put_progress(payload: ProgressPayload, request: Request, user: asyncpg.Record = Depends(current_user)):
    progress = payload.model_dump()
    progress["lessons"] = sorted(set(progress["lessons"]))[:1000]
    progress["puzzles"] = sorted(set(progress["puzzles"]))[:1000]
    progress["updatedAt"] = datetime.now(timezone.utc).isoformat()
    await request.app.state.pool.execute(
        """INSERT INTO player_progress (player_id, data, updated_at) VALUES ($1, $2::jsonb, NOW())
           ON CONFLICT (player_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()""",
        user["id"], json.dumps(progress),
    )
    return {"progress": progress}
