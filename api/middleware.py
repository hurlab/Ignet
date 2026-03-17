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
