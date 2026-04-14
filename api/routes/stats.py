"""
Statistics endpoint.

GET /api/v1/stats - overall database statistics with Redis cache
"""

import logging
import os
from datetime import datetime, timezone

from flask import Blueprint, jsonify

from db import db_connection, get_redis

logger = logging.getLogger(__name__)

stats_bp = Blueprint("stats", __name__)

# Redis key names (must match the keys used in the PHP codebase)
_KEY_GENES = "ignet:stats:total_genes"
_KEY_PMIDS = "ignet:stats:total_pmids"
_KEY_SENTENCES = "ignet:stats:total_sentences"
_KEY_INTERACTIONS = "ignet:stats:total_interactions"
_CACHE_TTL = 86400  # 24 hours

_PIPELINE_TRACKER = os.getenv(
    "IGNET_PIPELINE_TRACKER",
    "/var/lib/ignet/last_processed_number.txt",
)


def _get_data_last_updated() -> str | None:
    """Return ISO-8601 date string of the pipeline's last run, or None on failure."""
    try:
        mtime = os.path.getmtime(_PIPELINE_TRACKER)
        dt = datetime.fromtimestamp(mtime, tz=timezone.utc)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return None


def _get_from_cache(redis_client, key: str) -> int | None:
    """Return cached integer value or None on miss / Redis unavailable."""
    if redis_client is None:
        return None
    try:
        val = redis_client.get(key)
        return int(val) if val is not None else None
    except Exception:
        return None


def _set_cache(redis_client, key: str, value: int) -> None:
    """Store integer value in Redis; silently ignore failures."""
    if redis_client is None:
        return
    try:
        redis_client.set(key, str(value), ex=_CACHE_TTL)
    except Exception:
        pass


@stats_bp.route("/stats", methods=["GET"])
def get_stats():
    """
    Return aggregate statistics.

    Reads from Redis cache (TTL 24 h); falls back to live DB query on miss.
    Cache keys are shared with the PHP layer for consistency.
    """
    redis_client = get_redis()

    # Try to serve entirely from cache
    total_genes = _get_from_cache(redis_client, _KEY_GENES)
    total_pmids = _get_from_cache(redis_client, _KEY_PMIDS)
    total_sentences = _get_from_cache(redis_client, _KEY_SENTENCES)
    total_interactions = _get_from_cache(redis_client, _KEY_INTERACTIONS)

    # Determine which values need a live DB query
    needs_db = any(v is None for v in [total_genes, total_pmids, total_sentences, total_interactions])

    if needs_db:
        try:
            with db_connection() as conn:
                cursor = conn.cursor(dictionary=True)

                if total_interactions is None:
                    cursor.execute("SELECT COUNT(*) AS n FROM t_gene_pairs")
                    total_interactions = int((cursor.fetchone() or {}).get("n", 0))
                    _set_cache(redis_client, _KEY_INTERACTIONS, total_interactions)

                if total_sentences is None:
                    cursor.execute(
                        "SELECT COUNT(DISTINCT sentence_id) AS n FROM t_gene_pairs"
                    )
                    total_sentences = int((cursor.fetchone() or {}).get("n", 0))
                    _set_cache(redis_client, _KEY_SENTENCES, total_sentences)

                if total_pmids is None:
                    cursor.execute(
                        "SELECT COUNT(DISTINCT pmid) AS n FROM t_gene_pairs"
                    )
                    total_pmids = int((cursor.fetchone() or {}).get("n", 0))
                    _set_cache(redis_client, _KEY_PMIDS, total_pmids)

                if total_genes is None:
                    cursor.execute(
                        """
                        SELECT COUNT(DISTINCT gene) AS n
                        FROM (
                            SELECT gene_symbol1 AS gene FROM t_gene_pairs
                            UNION
                            SELECT gene_symbol2 AS gene FROM t_gene_pairs
                        ) AS g
                        WHERE gene IS NOT NULL
                        """
                    )
                    total_genes = int((cursor.fetchone() or {}).get("n", 0))
                    _set_cache(redis_client, _KEY_GENES, total_genes)

                cursor.close()

        except Exception as exc:
            logger.exception("Error fetching stats from database: %s", exc)
            return jsonify({"error": "DatabaseError", "message": "Failed to fetch statistics."}), 500

    return jsonify({
        "total_genes": total_genes,
        "total_pmids": total_pmids,
        "total_sentences": total_sentences,
        "total_interactions": total_interactions,
        "data_last_updated": _get_data_last_updated(),
    })
