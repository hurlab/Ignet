"""
Authentication and user management endpoints.

Blueprint registered at /api/v1:

  POST /api/v1/auth/register           — create account, return JWT
  POST /api/v1/auth/login              — verify credentials, return JWT
  GET  /api/v1/user/profile            — return profile (requires auth)
  POST /api/v1/user/api-keys           — save BYOK key (requires auth)
  GET  /api/v1/user/api-keys           — list saved providers (requires auth)
  DELETE /api/v1/user/api-keys/<prov>  — delete a key (requires auth)
"""

import logging
import re

from flask import Blueprint, g, jsonify, request

from auth_utils import (
    check_password,
    create_jwt,
    decrypt_api_key,
    encrypt_api_key,
    hash_password,
)
from db import db_connection
from middleware import require_auth, track_usage

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)

# Basic e-mail regex (good enough for server-side pre-validation)
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ---------------------------------------------------------------------------
# POST /api/v1/auth/register
# ---------------------------------------------------------------------------


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    """Register a new user account and return a JWT."""
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "InvalidJSON", "message": "Request body must be valid JSON."}), 400

    username: str = (body.get("username") or "").strip()
    email: str = (body.get("email") or "").strip().lower()
    password: str = body.get("password") or ""

    if not _EMAIL_RE.match(email):
        return jsonify({"error": "ValidationError", "message": "Invalid email format."}), 400
    if len(password) < 8:
        return jsonify({"error": "ValidationError", "message": "Password must be at least 8 characters."}), 400
    if username and len(username) > 100:
        return jsonify({"error": "ValidationError", "message": "Username must be 100 characters or less."}), 400

    pw_hash = hash_password(password)

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                (username or None, email, pw_hash),
            )
            conn.commit()
            user_id: int = cursor.lastrowid
            cursor.close()
    except Exception as exc:
        # MySQL error 1062 = Duplicate entry
        if "1062" in str(exc) or "Duplicate entry" in str(exc):
            return jsonify({"error": "Conflict", "message": "Email already registered."}), 409
        logger.exception("Database error during registration: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Could not create account."}), 500

    token = create_jwt(user_id, email, "user")
    track_usage("auth_register", user_id=user_id)

    return jsonify({
        "token": token,
        "user": {"id": user_id, "email": email, "username": username or None, "role": "user"},
    }), 201


# ---------------------------------------------------------------------------
# POST /api/v1/auth/login
# ---------------------------------------------------------------------------


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    """Authenticate an existing user and return a JWT."""
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "InvalidJSON", "message": "Request body must be valid JSON."}), 400

    email: str = (body.get("email") or "").strip().lower()
    password: str = body.get("password") or ""

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id, password_hash, role FROM users WHERE email = %s",
                (email,),
            )
            user = cursor.fetchone()
            cursor.close()
    except Exception as exc:
        logger.exception("Database error during login: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Login failed."}), 500

    if not user or not check_password(password, user["password_hash"]):
        logger.warning("Failed login attempt for email=%s from ip=%s", email, request.remote_addr)
        return jsonify({"error": "Unauthorized", "message": "Invalid email or password."}), 401

    # Update last_login (non-fatal)
    try:
        with db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET last_login = NOW() WHERE id = %s",
                (user["id"],),
            )
            conn.commit()
            cursor.close()
    except Exception as exc:
        logger.warning("Failed to update last_login: %s", exc)

    token = create_jwt(user["id"], email, user["role"])
    track_usage("auth_login", user_id=user["id"])

    return jsonify({
        "token": token,
        "user": {"id": user["id"], "email": email, "role": user["role"]},
    }), 200


# ---------------------------------------------------------------------------
# GET /api/v1/user/profile
# ---------------------------------------------------------------------------


@auth_bp.route("/user/profile", methods=["GET"])
@require_auth
def get_profile():
    """Return the authenticated user's profile."""
    user = g.user

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id, username, email, role, created_at FROM users WHERE id = %s",
                (user["id"],),
            )
            row = cursor.fetchone()
            cursor.close()
    except Exception as exc:
        logger.exception("Database error fetching profile: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Could not load profile."}), 500

    if not row:
        return jsonify({"error": "NotFound", "message": "User not found."}), 404

    track_usage("user_profile")

    return jsonify({
        "id": row["id"],
        "username": row.get("username"),
        "email": row["email"],
        "role": row["role"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }), 200


# ---------------------------------------------------------------------------
# POST /api/v1/user/api-keys
# ---------------------------------------------------------------------------


@auth_bp.route("/user/api-keys", methods=["POST"])
@require_auth
def save_api_key():
    """Save (or replace) a BYOK API key for the authenticated user."""
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "InvalidJSON", "message": "Request body must be valid JSON."}), 400

    provider: str = (body.get("provider") or "").strip().lower()
    key: str = body.get("key") or ""

    if not provider:
        return jsonify({"error": "ValidationError", "message": "'provider' is required."}), 400
    if not key:
        return jsonify({"error": "ValidationError", "message": "'key' is required."}), 400

    encrypted = encrypt_api_key(key)

    try:
        with db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO api_keys (user_id, provider, encrypted_key)
                   VALUES (%s, %s, %s)
                   ON DUPLICATE KEY UPDATE encrypted_key = VALUES(encrypted_key),
                                           created_at = NOW()""",
                (g.user["id"], provider, encrypted),
            )
            conn.commit()
            cursor.close()
    except Exception as exc:
        logger.exception("Database error saving API key: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Could not save key."}), 500

    track_usage("api_key_save")

    return jsonify({"provider": provider, "status": "saved"}), 200


# ---------------------------------------------------------------------------
# GET /api/v1/user/api-keys
# ---------------------------------------------------------------------------


@auth_bp.route("/user/api-keys", methods=["GET"])
@require_auth
def list_api_keys():
    """Return a list of providers for which the user has stored keys."""
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT provider, created_at FROM api_keys WHERE user_id = %s ORDER BY provider",
                (g.user["id"],),
            )
            rows = cursor.fetchall()
            cursor.close()
    except Exception as exc:
        logger.exception("Database error listing API keys: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Could not list keys."}), 500

    track_usage("api_key_list")

    return jsonify({
        "keys": [
            {
                "provider": r["provider"],
                "created_at": r["created_at"].isoformat() if r["created_at"] else None,
            }
            for r in rows
        ]
    }), 200


# ---------------------------------------------------------------------------
# DELETE /api/v1/user/api-keys/<provider>
# ---------------------------------------------------------------------------


@auth_bp.route("/user/api-keys/<string:provider>", methods=["DELETE"])
@require_auth
def delete_api_key(provider: str):
    """Delete the stored key for the given provider."""
    provider = provider.strip().lower()

    try:
        with db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM api_keys WHERE user_id = %s AND provider = %s",
                (g.user["id"], provider),
            )
            conn.commit()
            cursor.close()
    except Exception as exc:
        logger.exception("Database error deleting API key: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Could not delete key."}), 500

    track_usage("api_key_delete")

    return "", 204
