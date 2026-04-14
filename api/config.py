"""
Configuration module for Ignet REST API.
Reads environment variables with defaults matching BioSummarAI service.
Loads .env from biosummarAI directory if present.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the biosummarAI directory (shared credentials)
_env_path = Path(__file__).parent.parent / "biosummarAI" / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()  # fallback to any .env in cwd

# Database settings
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "ignet")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_DATABASE = os.getenv("DB_DATABASE", "ignet")

# Redis settings
REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

# Downstream service URLs
BIOSUMMARAI_URL = os.getenv("BIOSUMMARAI_URL", "http://localhost:9636")
BIOBERT_URL = os.getenv("BIOBERT_URL", "http://localhost:9635")

# API server port
API_PORT = int(os.getenv("API_PORT", "9637"))

# JWT settings
import secrets as _secrets
import logging as _logging

_jwt_secret = os.getenv("JWT_SECRET")
if not _jwt_secret:
    _jwt_secret = _secrets.token_hex(32)
    _log = _logging.getLogger(__name__)
    _log.error(
        "PRODUCTION WARNING: JWT_SECRET not set. Generated a random secret. "
        "All tokens will be INVALIDATED on restart. "
        "Set JWT_SECRET in biosummarAI/.env for production use."
    )
JWT_SECRET: str = _jwt_secret

# Fernet encryption key for BYOK API keys
_fernet_key = os.getenv("FERNET_KEY")
if not _fernet_key:
    from cryptography.fernet import Fernet as _Fernet
    _fernet_key = _Fernet.generate_key().decode()
    _log = _logging.getLogger(__name__)
    _log.error(
        "PRODUCTION WARNING: FERNET_KEY not set. Generated a random key. "
        "Stored API keys will be UNREADABLE after restart. "
        "Set FERNET_KEY in biosummarAI/.env for production use."
    )
FERNET_KEY: str = _fernet_key
