"""
Authentication middleware and usage-tracking helper for Ignet REST API.

Provides:
  @require_auth   — validates JWT from Authorization: Bearer header, sets g.user
  @require_admin  — same as require_auth but also enforces role == 'admin'
  track_usage()   — non-blocking insert into usage_events table
"""

import logging
from functools import wraps
from typing import Any, Callable

from flask import g, jsonify, request

from auth_utils import decode_jwt

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Auth decorators
# ---------------------------------------------------------------------------


def _extract_bearer_token() -> str | None:
    """Return the raw JWT from the Authorization header, or None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return auth_header[len("Bearer "):]


def require_auth(f: Callable) -> Callable:
    """
    Decorator that enforces JWT authentication.

    On success, sets g.user = {"id": ..., "email": ..., "role": ...}.
    Returns 401 JSON if the token is missing or invalid.
    """
    @wraps(f)
    def decorated(*args: Any, **kwargs: Any):
        token = _extract_bearer_token()
        if not token:
            return jsonify({"error": "Unauthorized", "message": "Missing or invalid Authorization header."}), 401

        payload = decode_jwt(token)
        if payload is None:
            return jsonify({"error": "Unauthorized", "message": "Token is invalid or expired."}), 401

        g.user = {
            "id": payload["sub"],
            "email": payload["email"],
            "role": payload["role"],
        }
        return f(*args, **kwargs)

    return decorated


def require_admin(f: Callable) -> Callable:
    """
    Decorator that enforces JWT authentication AND admin role.

    Returns 401 for missing/invalid token, 403 if the role is not 'admin'.
    """
    @wraps(f)
    def decorated(*args: Any, **kwargs: Any):
        token = _extract_bearer_token()
        if not token:
            return jsonify({"error": "Unauthorized", "message": "Missing or invalid Authorization header."}), 401

        payload = decode_jwt(token)
        if payload is None:
            return jsonify({"error": "Unauthorized", "message": "Token is invalid or expired."}), 401

        if payload.get("role") != "admin":
            return jsonify({"error": "Forbidden", "message": "Admin access required."}), 403

        g.user = {
            "id": payload["sub"],
            "email": payload["email"],
            "role": payload["role"],
        }
        return f(*args, **kwargs)

    return decorated


# ---------------------------------------------------------------------------
# Usage tracking
# ---------------------------------------------------------------------------


def check_daily_llm_limit() -> tuple[bool, str]:
    """
    Check if the current request is within the daily LLM usage limit.

    Returns (allowed, message):
      - (True, "") if the request should proceed
      - (False, "message") if the limit is exceeded

    Rules:
      - Authenticated users: always allowed (unlimited)
      - Anonymous users: 3 GPT-4o requests per day per IP
    """
    # If user is already set on g (e.g. @require_auth was used), always allow
    user = getattr(g, "user", None)

    # Try to extract user from a Bearer token even without @require_auth
    if not user:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            payload = decode_jwt(auth_header[len("Bearer "):])
            if payload:
                user = {"id": payload["sub"]}

    if user:
        return True, ""

    # Check anonymous daily usage by IP
    ip = request.remote_addr or "unknown"
    try:
        from db import get_db  # local import to avoid circular deps

        conn = get_db()
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """SELECT COUNT(*) AS cnt FROM usage_events
                   WHERE ip_address = %s
                   AND event_type = 'llm_request'
                   AND DATE(created_at) = CURDATE()""",
                (ip,),
            )
            row = cursor.fetchone()
            count = row["cnt"] if row else 0
            cursor.close()
        finally:
            conn.close()

        if count >= 20:
            return (
                False,
                "Daily limit reached (20 AI requests per day). Sign in for unlimited access.",
            )
        return True, ""

    except Exception as exc:
        logger.debug("LLM limit check failed (allowing): %s", exc)
        return True, ""  # Fail open


def track_llm_usage() -> None:
    """Record an LLM usage event for rate limiting."""
    ip = request.remote_addr or "unknown"
    user = getattr(g, "user", None)
    user_id = user["id"] if user else None
    try:
        from db import get_db  # local import to avoid circular deps

        conn = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO usage_events (event_type, endpoint, user_id, ip_address)
                   VALUES (%s, %s, %s, %s)""",
                ("llm_request", request.path, user_id, ip),
            )
            conn.commit()
            cursor.close()
        finally:
            conn.close()

    except Exception as exc:
        logger.debug("LLM usage tracking failed: %s", exc)


def track_usage(endpoint_name: str, user_id: int | None = None) -> None:
    """
    Insert one row into usage_events.

    This function is intentionally non-blocking: any database error is
    caught and logged so that the main request is never affected.
    """
    try:
        from db import get_db  # local import to avoid circular deps

        user = getattr(g, "user", None)
        effective_user_id = user_id if user_id is not None else (user["id"] if user else None)
        ip_address = request.remote_addr or ""

        conn = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO usage_events (event_type, endpoint, user_id, ip_address)
                   VALUES (%s, %s, %s, %s)""",
                ("api_request", endpoint_name, effective_user_id, ip_address),
            )
            conn.commit()
            cursor.close()
        finally:
            conn.close()

    except Exception as exc:
        logger.debug("Usage tracking failed (non-fatal): %s", exc)
