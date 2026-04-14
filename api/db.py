"""
Database connection module for Ignet REST API.
Provides MySQL connection pool and Redis client with graceful fallback.
"""

import logging
from contextlib import contextmanager

import mysql.connector
from mysql.connector import pooling
import redis as redis_lib

from config import (
    DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE,
    REDIS_HOST, REDIS_PORT,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# MySQL connection pool
# ---------------------------------------------------------------------------

_pool: pooling.MySQLConnectionPool | None = None


def _get_pool() -> pooling.MySQLConnectionPool:
    """Return (and lazily initialise) the MySQL connection pool."""
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="ignet_pool",
            pool_size=10,
            pool_reset_session=True,
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_DATABASE,
            autocommit=True,
            connection_timeout=10,
            charset="utf8mb4",
        )
    return _pool


def get_db():
    """
    Return a connection from the pool.

    Usage (explicit close):
        conn = get_db()
        try:
            ...
        finally:
            conn.close()

    Prefer the context-manager form below for automatic cleanup.
    """
    return _get_pool().get_connection()


@contextmanager
def db_connection():
    """
    Context manager that yields a MySQL connection and closes it automatically.

    Usage:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, params)
            rows = cursor.fetchall()
    """
    conn = get_db()
    try:
        yield conn
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Redis client
# ---------------------------------------------------------------------------

_redis_client: redis_lib.Redis | None = None
_redis_available: bool | None = None


def get_redis() -> redis_lib.Redis | None:
    """
    Return a Redis client instance.
    Returns None if Redis is unavailable (graceful fallback).
    """
    global _redis_client, _redis_available

    # Return cached result (None or client)
    if _redis_available is False:
        return None
    if _redis_client is not None:
        return _redis_client

    try:
        client = redis_lib.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        client.ping()  # verify connectivity
        _redis_client = client
        _redis_available = True
        return _redis_client
    except Exception as exc:
        logger.warning("Redis unavailable (%s); caching disabled.", exc)
        _redis_available = False
        return None
