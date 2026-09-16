import asyncio
import hashlib
import html
import json
import logging
import os
import re
import secrets
import smtplib
import ssl
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
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
APP_BASE_URL = os.environ.get("APP_BASE_URL", "https://chess.whitplex.com").rstrip("/")
SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM = os.environ.get("SMTP_FROM", "")
USERNAME_RE = re.compile(r"^[A-Za-z0-9_-]{3,24}$")
PIN_RE = re.compile(r"^[0-9]{6}$")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
password_hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=2)
login_attempts: dict[str, list[float]] = {}
reset_attempts: dict[str, list[float]] = {}
logger = logging.getLogger("whit_chess")


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=24)
    pin: str = Field(min_length=6, max_length=6)


class Registration(Credentials):
    inviteCode: str = Field(min_length=4, max_length=128)


class ProfileUpdate(BaseModel):
    displayName: str | None = Field(default=None, max_length=80)
    email: str | None = Field(default=None, max_length=254)


class TokenPayload(BaseModel):
    token: str = Field(min_length=32, max_length=256)


class PinResetRequest(BaseModel):
    username: str = Field(min_length=3, max_length=24)
    email: str = Field(min_length=3, max_length=254)


class PinReset(TokenPayload):
    pin: str = Field(min_length=6, max_length=6)


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


def clean_profile(display_name: str | None, email: str | None) -> tuple[str | None, str | None, str | None]:
    name = display_name.strip() if display_name else None
    if name and (len(name) > 80 or any(ord(char) < 32 for char in name)):
        raise HTTPException(status_code=400, detail="Name must be 80 characters or fewer.")
    clean_email = email.strip().lower() if email else None
    if clean_email and (len(clean_email) > 254 or not EMAIL_RE.fullmatch(clean_email)):
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    return name, clean_email, clean_email


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def issue_token(user_id: str, username: str, auth_version: int = 1) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": user_id, "username": username, "ver": auth_version, "iat": now, "exp": now + timedelta(days=SESSION_DAYS)},
        SESSION_SECRET,
        algorithm="HS256",
    )


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


def check_reset_rate(request: Request, identity: str) -> bool:
    key = rate_limit_key(request, f"reset:{identity}")
    cutoff = time.time() - 900
    reset_attempts[key] = [attempt for attempt in reset_attempts.get(key, []) if attempt > cutoff]
    if len(reset_attempts[key]) >= 4:
        return False
    reset_attempts[key].append(time.time())
    return True


def email_is_configured() -> bool:
    return bool(SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD and SMTP_FROM)


def send_email(to_address: str, subject: str, text_body: str, html_body: str) -> None:
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = SMTP_FROM
    message["To"] = to_address
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")
    context = ssl.create_default_context()
    if SMTP_PORT in {465, 2465}:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=15, context=context) as smtp:
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(message)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
            smtp.ehlo()
            smtp.starttls(context=context)
            smtp.ehlo()
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(message)


async def deliver_account_email(to_address: str, display_name: str, purpose: str, token: str) -> None:
    action = "verify-email" if purpose == "verify" else "reset-pin"
    link = f"{APP_BASE_URL}/#{action}={token}"
    safe_name = html.escape(display_name or "chess player")
    if purpose == "verify":
        subject = "Verify your Whit the Chess email"
        heading = "Verify your email"
        instruction = "Use this link within 30 minutes to verify your email for PIN recovery."
    else:
        subject = "Reset your Whit the Chess PIN"
        heading = "Reset your PIN"
        instruction = "Use this link within 15 minutes to choose a new six-digit PIN."
    text_body = f"Hi {display_name or 'chess player'},\n\n{instruction}\n\n{link}\n\nIf you did not request this, you can ignore this email."
    html_body = (
        f"<div style='font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#24213a'>"
        f"<h1 style='color:#45339c'>{heading}</h1><p>Hi {safe_name},</p><p>{instruction}</p>"
        f"<p><a href='{html.escape(link)}' style='display:inline-block;background:#7258e8;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold'>{heading}</a></p>"
        f"<p style='color:#6d6982'>If you did not request this, you can safely ignore this email.</p></div>"
    )
    await asyncio.to_thread(send_email, to_address, subject, text_body, html_body)


async def create_account_token(connection: asyncpg.Connection, user: asyncpg.Record, purpose: str, minutes: int) -> str:
    raw_token = secrets.token_urlsafe(36)
    await connection.execute("DELETE FROM account_tokens WHERE expires_at <= NOW() OR used_at IS NOT NULL")
    await connection.execute(
        "DELETE FROM account_tokens WHERE player_id = $1 AND purpose = $2",
        user["id"],
        purpose,
    )
    await connection.execute(
        """INSERT INTO account_tokens (id, player_id, purpose, token_hash, email_key, expires_at)
           VALUES ($1, $2, $3, $4, $5, NOW() + ($6 * INTERVAL '1 minute'))""",
        uuid.uuid4(), user["id"], purpose, token_digest(raw_token), user["email_key"], minutes,
    )
    return raw_token


async def current_user(request: Request, token: str | None = Cookie(default=None, alias=COOKIE_NAME)) -> asyncpg.Record:
    if not token:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    try:
        payload = jwt.decode(token, SESSION_SECRET, algorithms=["HS256"])
        user_id = uuid.UUID(payload["sub"])
        token_version = int(payload.get("ver", 1))
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(status_code=401, detail="Your session has expired. Please sign in again.") from None
    user = await request.app.state.pool.fetchrow(
        """SELECT id, username, display_name, email, email_key, email_verified_at, auth_version
           FROM players WHERE id = $1""",
        user_id,
    )
    if not user or user["auth_version"] != token_version:
        raise HTTPException(status_code=401, detail="Player account not found.")
    return user


async def player_bundle(pool: asyncpg.Pool, user: asyncpg.Record) -> dict[str, Any]:
    row = await pool.fetchrow("SELECT data FROM player_progress WHERE player_id = $1", user["id"])
    if not row:
        progress = default_progress()
    else:
        raw_progress = row["data"]
        progress = json.loads(raw_progress) if isinstance(raw_progress, str) else dict(raw_progress)
    return {
        "player": {
            "id": str(user["id"]),
            "username": user["username"],
            "displayName": user["display_name"],
            "email": user["email"],
            "emailVerified": bool(user["email_verified_at"]),
        },
        "progress": progress,
    }


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
                display_name VARCHAR(80),
                email VARCHAR(254),
                email_key VARCHAR(254),
                email_verified_at TIMESTAMPTZ,
                auth_version INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_login_at TIMESTAMPTZ
            )
        """)
        await connection.execute("ALTER TABLE players ADD COLUMN IF NOT EXISTS display_name VARCHAR(80)")
        await connection.execute("ALTER TABLE players ADD COLUMN IF NOT EXISTS email VARCHAR(254)")
        await connection.execute("ALTER TABLE players ADD COLUMN IF NOT EXISTS email_key VARCHAR(254)")
        await connection.execute("ALTER TABLE players ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ")
        await connection.execute("ALTER TABLE players ADD COLUMN IF NOT EXISTS auth_version INTEGER NOT NULL DEFAULT 1")
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS player_progress (
                player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
                data JSONB NOT NULL DEFAULT '{}'::jsonb,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS account_tokens (
                id UUID PRIMARY KEY,
                player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
                purpose VARCHAR(16) NOT NULL,
                token_hash CHAR(64) NOT NULL UNIQUE,
                email_key VARCHAR(254) NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                used_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
        await connection.execute("CREATE INDEX IF NOT EXISTS account_tokens_player_idx ON account_tokens (player_id, purpose)")
        await connection.execute("CREATE INDEX IF NOT EXISTS players_recovery_idx ON players (username_key, email_key)")
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
                """INSERT INTO players (id, username, username_key, pin_hash) VALUES ($1, $2, $3, $4)
                   RETURNING id, username, display_name, email, email_key, email_verified_at, auth_version""",
                player_id, username, username_key, pin_hash,
            )
            await connection.execute(
                "INSERT INTO player_progress (player_id, data) VALUES ($1, $2::jsonb)",
                player_id, json.dumps(default_progress()),
            )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=409, detail="That username is already taken.") from None
    set_session_cookie(response, issue_token(str(user["id"]), user["username"], user["auth_version"]))
    return await player_bundle(request.app.state.pool, user)


@app.post("/auth/login")
async def login(payload: Credentials, request: Request, response: Response):
    _, username_key = validate_credentials(payload.username, payload.pin)
    key = check_login_rate(request, payload.username)
    user = await request.app.state.pool.fetchrow(
        """SELECT id, username, pin_hash, display_name, email, email_key, email_verified_at, auth_version
           FROM players WHERE username_key = $1""",
        username_key,
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
    set_session_cookie(response, issue_token(str(user["id"]), user["username"], user["auth_version"]))
    return await player_bundle(request.app.state.pool, user)


@app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, domain=COOKIE_DOMAIN, path="/")


@app.post("/auth/verify-email")
async def verify_email(payload: TokenPayload, request: Request):
    async with request.app.state.pool.acquire() as connection, connection.transaction():
        token = await connection.fetchrow(
            """SELECT id, player_id, email_key FROM account_tokens
               WHERE token_hash = $1 AND purpose = 'verify' AND used_at IS NULL AND expires_at > NOW()
               FOR UPDATE""",
            token_digest(payload.token),
        )
        if not token:
            raise HTTPException(status_code=400, detail="That verification link is invalid or expired.")
        updated = await connection.fetchrow(
            """UPDATE players SET email_verified_at = NOW()
               WHERE id = $1 AND email_key = $2
               RETURNING id""",
            token["player_id"], token["email_key"],
        )
        if not updated:
            raise HTTPException(status_code=400, detail="That email address is no longer attached to the account.")
        await connection.execute("UPDATE account_tokens SET used_at = NOW() WHERE id = $1", token["id"])
    return {"message": "Email verified. PIN recovery is ready."}


@app.post("/auth/request-pin-reset", status_code=status.HTTP_202_ACCEPTED)
async def request_pin_reset(payload: PinResetRequest, request: Request):
    username = payload.username.strip()
    email = payload.email.strip().lower()
    allowed = check_reset_rate(request, f"{username.lower()}:{email}")
    if allowed and email_is_configured():
        user = await request.app.state.pool.fetchrow(
            """SELECT id, username, display_name, email, email_key
               FROM players
               WHERE username_key = $1 AND email_key = $2 AND email_verified_at IS NOT NULL""",
            username.lower(), email,
        )
        if user:
            async with request.app.state.pool.acquire() as connection, connection.transaction():
                reset_token = await create_account_token(connection, user, "reset", 15)
            try:
                await deliver_account_email(user["email"], user["display_name"] or user["username"], "reset", reset_token)
            except Exception:
                logger.exception("Could not deliver PIN reset email")
    return {"message": "If that verified account exists, a reset link is on its way."}


@app.post("/auth/reset-pin")
async def reset_pin(payload: PinReset, request: Request):
    if not PIN_RE.fullmatch(payload.pin):
        raise HTTPException(status_code=400, detail="PIN must contain exactly six numbers.")
    pin_hash = password_hasher.hash(payload.pin)
    async with request.app.state.pool.acquire() as connection, connection.transaction():
        token = await connection.fetchrow(
            """SELECT id, player_id, email_key FROM account_tokens
               WHERE token_hash = $1 AND purpose = 'reset' AND used_at IS NULL AND expires_at > NOW()
               FOR UPDATE""",
            token_digest(payload.token),
        )
        if not token:
            raise HTTPException(status_code=400, detail="That reset link is invalid or expired.")
        updated = await connection.fetchrow(
            """UPDATE players SET pin_hash = $1, auth_version = auth_version + 1
               WHERE id = $2 AND email_key = $3 AND email_verified_at IS NOT NULL
               RETURNING id""",
            pin_hash, token["player_id"], token["email_key"],
        )
        if not updated:
            raise HTTPException(status_code=400, detail="That reset link is no longer valid.")
        await connection.execute("UPDATE account_tokens SET used_at = NOW() WHERE id = $1", token["id"])
        await connection.execute("DELETE FROM account_tokens WHERE player_id = $1 AND purpose = 'reset' AND id <> $2", token["player_id"], token["id"])
    return {"message": "PIN updated. Sign in with your new PIN."}


@app.get("/api/me")
async def me(request: Request, user: asyncpg.Record = Depends(current_user)):
    return await player_bundle(request.app.state.pool, user)


@app.put("/api/profile")
async def update_profile(payload: ProfileUpdate, request: Request, user: asyncpg.Record = Depends(current_user)):
    display_name, email, email_key = clean_profile(payload.displayName, payload.email)
    email_changed = email_key != user["email_key"]
    verification_token = None
    async with request.app.state.pool.acquire() as connection, connection.transaction():
        updated_user = await connection.fetchrow(
            """UPDATE players
               SET display_name = $1,
                   email = $2,
                   email_key = $3,
                   email_verified_at = CASE WHEN email_key IS NOT DISTINCT FROM $3 THEN email_verified_at ELSE NULL END
               WHERE id = $4
               RETURNING id, username, display_name, email, email_key, email_verified_at, auth_version""",
            display_name, email, email_key, user["id"],
        )
        if email_changed and email_key:
            verification_token = await create_account_token(connection, updated_user, "verify", 30)
    email_sent = False
    if verification_token and email_is_configured():
        try:
            await deliver_account_email(email, display_name or user["username"], "verify", verification_token)
            email_sent = True
        except Exception:
            logger.exception("Could not deliver verification email")
    bundle = await player_bundle(request.app.state.pool, updated_user)
    bundle["emailSent"] = email_sent
    bundle["message"] = "Profile saved. Check your email to verify PIN recovery." if email_sent else "Profile saved."
    return bundle


@app.post("/api/profile/send-verification")
async def send_verification(request: Request, user: asyncpg.Record = Depends(current_user)):
    if not user["email_key"]:
        raise HTTPException(status_code=400, detail="Add an email address first.")
    if user["email_verified_at"]:
        return {"message": "Your email is already verified."}
    if not email_is_configured():
        raise HTTPException(status_code=503, detail="Email delivery is not configured yet.")
    if not check_reset_rate(request, f"verify:{user['id']}"):
        raise HTTPException(status_code=429, detail="Too many verification emails. Wait fifteen minutes and try again.")
    async with request.app.state.pool.acquire() as connection, connection.transaction():
        verification_token = await create_account_token(connection, user, "verify", 30)
    try:
        await deliver_account_email(user["email"], user["display_name"] or user["username"], "verify", verification_token)
    except Exception:
        logger.exception("Could not resend verification email")
        raise HTTPException(status_code=503, detail="The verification email could not be sent. Try again shortly.") from None
    return {"message": "Verification email sent."}


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
