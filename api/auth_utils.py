"""
Authentication utilities for Ignet REST API.

Provides password hashing, JWT creation/decoding, and Fernet
encryption/decryption of BYOK API keys.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt
from cryptography.fernet import Fernet, InvalidToken

from config import JWT_SECRET, FERNET_KEY

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------


def hash_password(password: str) -> str:
    """Return a bcrypt hash of the given plain-text password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def check_password(password: str, hashed: str) -> bool:
    """Return True if *password* matches the bcrypt *hashed* string."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

_JWT_ALGORITHM = "HS256"
_JWT_EXPIRY_HOURS = 24


def create_jwt(user_id: int, email: str, role: str) -> str:
    """
    Create a signed JWT for the given user.

    The token expires after 24 hours and is signed with JWT_SECRET using HS256.
    PyJWT 2.x requires 'sub' to be a string.
    """
    now = datetime.now(tz=timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + timedelta(hours=_JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=_JWT_ALGORITHM)


def decode_jwt(token: str) -> dict[str, Any] | None:
    """
    Decode and validate a JWT.

    Returns the payload dict on success, or None if the token is
    missing, expired, or has an invalid signature.  The 'sub' claim
    is returned as an integer (user_id) for convenience.
    """
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[_JWT_ALGORITHM],
            options={"verify_sub": False},  # we store user_id as string sub
        )
        # Normalise sub back to int
        payload["sub"] = int(payload["sub"])
        return payload
    except jwt.ExpiredSignatureError:
        logger.debug("JWT expired")
        return None
    except jwt.InvalidTokenError as exc:
        logger.debug("Invalid JWT: %s", exc)
        return None
    except (ValueError, TypeError) as exc:
        logger.debug("JWT sub conversion failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# BYOK API key encryption
# ---------------------------------------------------------------------------

_fernet = Fernet(FERNET_KEY.encode() if isinstance(FERNET_KEY, str) else FERNET_KEY)


def encrypt_api_key(key: str) -> str:
    """Encrypt a plain-text API key using Fernet symmetric encryption."""
    return _fernet.encrypt(key.encode("utf-8")).decode("utf-8")


def decrypt_api_key(encrypted: str) -> str | None:
    """
    Decrypt a Fernet-encrypted API key.

    Returns the plain-text key, or None if decryption fails.
    """
    try:
        return _fernet.decrypt(encrypted.encode("utf-8")).decode("utf-8")
    except (InvalidToken, Exception) as exc:
        logger.warning("Failed to decrypt API key: %s", exc)
        return None
