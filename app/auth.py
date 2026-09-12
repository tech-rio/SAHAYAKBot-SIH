"""
SAHAYAKBot Authentication Module
Simple token-based admin authentication.
"""
import hashlib
import secrets
import time
from functools import wraps
from fastapi import HTTPException, Header, Request, Response
from typing import Optional
from app.config import ADMIN_PASSWORD

# In-memory session store (sufficient for prototype)
_admin_sessions = {}
SESSION_EXPIRY = 3600 * 4  # 4 hours


def _hash_password(password: str) -> str:
    """Hash a password with SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_admin_session(password: str) -> Optional[str]:
    """
    Verify admin password and create a session token.
    Returns session token or None if password is wrong.
    """
    if password == ADMIN_PASSWORD:
        token = secrets.token_urlsafe(32)
        _admin_sessions[token] = {
            "created_at": time.time(),
            "role": "admin"
        }
        return token
    return None


def verify_admin_session(token: str) -> bool:
    """Check if an admin session token is valid and not expired."""
    session = _admin_sessions.get(token)
    if not session:
        return False
    if time.time() - session["created_at"] > SESSION_EXPIRY:
        _admin_sessions.pop(token, None)
        return False
    return True


def require_admin(authorization: Optional[str] = Header(None)):
    """
    FastAPI dependency for admin-only endpoints.
    Expects: Authorization: Bearer <session-token>
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required. Login at /api/admin/login")
    
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format. Use: Bearer <token>")
    
    token = parts[1]
    if not verify_admin_session(token):
        raise HTTPException(status_code=403, detail="Invalid or expired session. Please login again.")
    
    return token
