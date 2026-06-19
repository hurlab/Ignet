"""Pathway over-representation endpoints (GO / KEGG / Reactome).

Computes hypergeometric enrichment locally against bundled GMT libraries — see
pathway_enrichment.py. No external service is contacted.
"""
import hashlib
import json
import logging

from flask import Blueprint, jsonify, request

from db import get_redis
from extensions import limiter
from pathway_enrichment import LIBRARIES, analyze_pathways
from utils import sanitize_gene_symbol

logger = logging.getLogger(__name__)
pathways_bp = Blueprint("pathways", __name__)

_CACHE_TTL = 86400
_CACHE_VERSION = "v1"


def _extract_genes(body):
    """Validate the body and return (genes, error_tuple). Mirrors the enrichment
    endpoint: 2–500 distinct valid symbols."""
    if not body or "genes" not in body:
        return None, ({"error": "MissingParameter", "message": "Provide 'genes' array."}, 400)
    raw = body["genes"]
    if not isinstance(raw, list) or len(raw) < 2:
        return None, ({"error": "InvalidInput", "message": "Provide at least 2 genes."}, 400)
    if len(raw) > 500:
        return None, ({"error": "InvalidInput", "message": "Maximum 500 genes."}, 400)
    genes = [sanitize_gene_symbol(g) for g in raw if g]
    genes = list(dict.fromkeys(g for g in genes if g))  # drop invalid + de-duplicate
    if len(genes) < 2:
        return None, ({"error": "InvalidInput", "message": "At least 2 valid gene symbols required."}, 400)
    return genes, None


def _cache_key(genes, libraries):
    norm = ",".join(sorted(set(genes))) + "|" + ",".join(sorted(libraries))
    digest = hashlib.sha1(norm.encode("utf-8")).hexdigest()
    return f"pathways:{_CACHE_VERSION}:{digest}"


@pathways_bp.route("/pathways/analyze", methods=["POST"])
@limiter.limit("12 per minute")
def analyze():
    body = request.get_json(silent=True)
    genes, err = _extract_genes(body)
    if err:
        return jsonify(err[0]), err[1]

    requested = body.get("libraries")
    if isinstance(requested, list) and requested:
        libraries = [name for name in requested if name in LIBRARIES]
        if not libraries:
            return jsonify({"error": "InvalidInput", "message": "No known libraries requested."}), 400
    else:
        libraries = list(LIBRARIES.keys())

    redis = get_redis()
    key = _cache_key(genes, libraries)
    if redis is not None:
        try:
            cached = redis.get(key)
            if cached:
                payload = json.loads(cached)
                payload["cached"] = True
                return jsonify(payload)
        except Exception:  # noqa: BLE001 - cache must never break the request
            logger.warning("pathways cache read failed", exc_info=True)

    results = analyze_pathways(genes, libraries)
    payload = {
        "input_genes": genes,
        "libraries": libraries,
        "results": results,
        "cached": False,
    }

    if redis is not None:
        try:
            redis.setex(key, _CACHE_TTL, json.dumps(payload))
        except Exception:  # noqa: BLE001
            logger.warning("pathways cache write failed", exc_info=True)

    return jsonify(payload)
