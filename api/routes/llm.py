"""
LLM/AI proxy endpoints.

POST /api/v1/summarize  - forward to BioSummarAI service
POST /api/v1/chat       - forward conversation to BioSummarAI service
POST /api/v1/predict    - forward sentences to BioBERT NER service
"""

import logging

import requests
from flask import Blueprint, g, jsonify, request

from config import BIOSUMMARAI_URL, BIOBERT_URL
from db import db_connection
from middleware import check_daily_llm_limit, track_llm_usage
from utils import sanitize_gene_symbol

logger = logging.getLogger(__name__)

llm_bp = Blueprint("llm", __name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Downstream service endpoints
_BIOSUMMARAI_ENDPOINT = f"{BIOSUMMARAI_URL}/biobert/"
_BIOBERT_ENDPOINT = f"{BIOBERT_URL}/biobert/"

# LLM calls can be slow; allow up to 2 minutes
_LLM_TIMEOUT = 120
# BioBERT prediction is typically fast
_BIOBERT_TIMEOUT = 60

# ---------------------------------------------------------------------------
# BYOK key resolution
# ---------------------------------------------------------------------------


def _get_user_openai_key() -> str | None:
    """
    Return the authenticated user's OpenAI key (plain text) if available.

    Returns None when:
      - no user is authenticated (public access)
      - the user has no stored key for 'openai'
      - decryption fails for any reason
    """
    user = getattr(g, "user", None)
    if not user:
        return None

    try:
        from db import db_connection
        from auth_utils import decrypt_api_key

        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT encrypted_key FROM api_keys WHERE user_id = %s AND provider = %s",
                (user["id"], "openai"),
            )
            row = cursor.fetchone()
            cursor.close()

        if not row:
            return None
        return decrypt_api_key(row["encrypted_key"])

    except Exception as exc:
        logger.debug("Could not fetch BYOK key: %s", exc)
        return None


# ---------------------------------------------------------------------------
# POST /api/v1/summarize
# ---------------------------------------------------------------------------


@llm_bp.route("/summarize", methods=["POST"])
def summarize():
    """
    Forward a summarisation request to the BioSummarAI service.

    Accepted request forms (all forwarded as-is after light validation):
      1. {"genes": ["BRCA1", "TP53"]}
      2. {"raw_sentences": "text..."}
      3. {"raw_sentences": "text", "instructions": "focus on..."}

    The BioSummarAI service performs the actual DB lookup and GPT call.
    """
    allowed, msg = check_daily_llm_limit()
    if not allowed:
        return jsonify({"error": "RateLimited", "message": msg}), 429

    body = request.get_json(silent=True)
    if body is None:
        return jsonify({"error": "InvalidJSON", "message": "Request body must be valid JSON."}), 400

    # At least one of the recognised input keys must be present
    if not any(key in body for key in ("genes", "raw_sentences", "conversation_history")):
        return jsonify({
            "error": "MissingParameter",
            "message": "Provide 'genes', 'raw_sentences', or 'conversation_history'.",
        }), 400

    # Sanitise gene symbols when provided as an array
    if "genes" in body:
        genes_raw = body["genes"]
        if not isinstance(genes_raw, list):
            return jsonify({"error": "InvalidInput", "message": "'genes' must be an array."}), 400
        body["genes"] = [sanitize_gene_symbol(g) for g in genes_raw if g]

    # Optionally attach the user's BYOK OpenAI key
    byok_key = _get_user_openai_key()
    if byok_key:
        body = dict(body)  # copy so we don't mutate the original
        body["openai_api_key"] = byok_key

    try:
        upstream = requests.post(
            _BIOSUMMARAI_ENDPOINT,
            json=body,
            timeout=_LLM_TIMEOUT,
        )
        upstream.raise_for_status()

        # Enrich response with entity lists from t_biosummary
        try:
            result = upstream.json()
            genes_input = body.get("genes", [])
            if genes_input:
                with db_connection() as conn:
                    cursor = conn.cursor(dictionary=True)
                    placeholders = ", ".join(["%s"] * len(genes_input))

                    # Get PMIDs for these genes
                    cursor.execute(
                        f"SELECT DISTINCT pmid FROM t_gene_pairs "
                        f"WHERE gene_symbol1 IN ({placeholders}) OR gene_symbol2 IN ({placeholders}) LIMIT 1000",
                        genes_input * 2
                    )
                    pmids = [r["pmid"] for r in cursor.fetchall()]

                    if pmids:
                        pmid_ph = ", ".join(["%s"] * len(pmids))

                        # Top gene symbols
                        cursor.execute(
                            f"SELECT gene_symbols, COUNT(*) AS cnt FROM t_biosummary "
                            f"WHERE pmid IN ({pmid_ph}) AND gene_symbols IS NOT NULL AND gene_symbols != '' "
                            f"GROUP BY gene_symbols ORDER BY cnt DESC LIMIT 20",
                            tuple(pmids)
                        )
                        top_genes = [{"term": r["gene_symbols"], "count": r["cnt"]} for r in cursor.fetchall()]

                        # Top drug terms
                        cursor.execute(
                            f"SELECT drug_term, COUNT(*) AS cnt FROM t_biosummary "
                            f"WHERE pmid IN ({pmid_ph}) AND drug_term IS NOT NULL AND drug_term != '' "
                            f"GROUP BY drug_term ORDER BY cnt DESC LIMIT 20",
                            tuple(pmids)
                        )
                        top_drugs = [{"term": r["drug_term"], "count": r["cnt"]} for r in cursor.fetchall()]

                        # Top HDO (disease) terms
                        cursor.execute(
                            f"SELECT hdo_term, COUNT(*) AS cnt FROM t_biosummary "
                            f"WHERE pmid IN ({pmid_ph}) AND hdo_term IS NOT NULL AND hdo_term != '' "
                            f"GROUP BY hdo_term ORDER BY cnt DESC LIMIT 20",
                            tuple(pmids)
                        )
                        top_diseases = [{"term": r["hdo_term"], "count": r["cnt"]} for r in cursor.fetchall()]

                        result["entities"] = {
                            "genes": top_genes,
                            "drugs": top_drugs,
                            "diseases": top_diseases,
                        }
                        cursor.close()

                track_llm_usage()
                return jsonify(result), upstream.status_code
        except Exception as ent_exc:
            logger.debug("Entity enrichment failed (non-fatal): %s", ent_exc)
            # Fall through to return the original response

        track_llm_usage()
        return jsonify(upstream.json()), upstream.status_code

    except requests.Timeout:
        logger.warning("BioSummarAI service timed out for /summarize")
        return jsonify({
            "error": "UpstreamTimeout",
            "message": "BioSummarAI service did not respond in time.",
        }), 504

    except requests.ConnectionError:
        logger.error("BioSummarAI service is unreachable at %s", _BIOSUMMARAI_ENDPOINT)
        return jsonify({
            "error": "ServiceUnavailable",
            "message": "BioSummarAI service is unavailable.",
        }), 503

    except requests.RequestException as exc:
        logger.exception("BioSummarAI request failed: %s", exc)
        status = exc.response.status_code if exc.response is not None else 502
        return jsonify({
            "error": "UpstreamError",
            "message": "BioSummarAI service returned an error.",
        }), status

    except Exception as exc:
        logger.exception("Unexpected error in /summarize: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Unexpected server error."}), 500


# ---------------------------------------------------------------------------
# POST /api/v1/chat
# ---------------------------------------------------------------------------


@llm_bp.route("/chat", methods=["POST"])
def chat():
    """
    Forward a chat/conversation continuation request to BioSummarAI.

    Request JSON:
        conversation_history  - list of prior messages (required)
        prompt                - new user message (required)
    """
    allowed, msg = check_daily_llm_limit()
    if not allowed:
        return jsonify({"error": "RateLimited", "message": msg}), 429

    body = request.get_json(silent=True)
    if body is None:
        return jsonify({"error": "InvalidJSON", "message": "Request body must be valid JSON."}), 400

    if "conversation_history" not in body or "prompt" not in body:
        return jsonify({
            "error": "MissingParameter",
            "message": "Both 'conversation_history' and 'prompt' are required.",
        }), 400

    if not isinstance(body["conversation_history"], list):
        return jsonify({"error": "InvalidInput", "message": "'conversation_history' must be an array."}), 400

    # Optionally attach the user's BYOK OpenAI key
    byok_key = _get_user_openai_key()
    if byok_key:
        body = dict(body)  # copy so we don't mutate the original
        body["openai_api_key"] = byok_key

    try:
        upstream = requests.post(
            _BIOSUMMARAI_ENDPOINT,
            json=body,
            timeout=_LLM_TIMEOUT,
        )
        upstream.raise_for_status()
        track_llm_usage()
        return jsonify(upstream.json()), upstream.status_code

    except requests.Timeout:
        logger.warning("BioSummarAI service timed out for /chat")
        return jsonify({
            "error": "UpstreamTimeout",
            "message": "BioSummarAI service did not respond in time.",
        }), 504

    except requests.ConnectionError:
        logger.error("BioSummarAI service is unreachable at %s", _BIOSUMMARAI_ENDPOINT)
        return jsonify({
            "error": "ServiceUnavailable",
            "message": "BioSummarAI service is unavailable.",
        }), 503

    except requests.RequestException as exc:
        logger.exception("BioSummarAI request failed in /chat: %s", exc)
        status = exc.response.status_code if exc.response is not None else 502
        return jsonify({
            "error": "UpstreamError",
            "message": "BioSummarAI service returned an error.",
        }), status

    except Exception as exc:
        logger.exception("Unexpected error in /chat: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Unexpected server error."}), 500


# ---------------------------------------------------------------------------
# POST /api/v1/predict
# ---------------------------------------------------------------------------


@llm_bp.route("/predict", methods=["POST"])
def predict():
    """
    Forward sentence prediction requests to the BioBERT NER service.

    Request JSON (array):
        [{"Sentence": "...", "ID": 123, "MatchTerm": "gene"}, ...]

    The response is the BioBERT service JSON passed through as-is.
    """
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({"error": "InvalidJSON", "message": "Request body must be valid JSON."}), 400

    if not isinstance(body, list):
        return jsonify({"error": "InvalidInput", "message": "Request body must be a JSON array."}), 400

    if len(body) == 0:
        return jsonify({"error": "InvalidInput", "message": "Input array must not be empty."}), 400

    # Validate each element has required keys
    for idx, item in enumerate(body):
        if not isinstance(item, dict):
            return jsonify({
                "error": "InvalidInput",
                "message": f"Element at index {idx} must be an object.",
            }), 400
        if "Sentence" not in item:
            return jsonify({
                "error": "MissingParameter",
                "message": f"Element at index {idx} is missing 'Sentence'.",
            }), 400

    try:
        upstream = requests.post(
            _BIOBERT_ENDPOINT,
            json=body,
            timeout=_BIOBERT_TIMEOUT,
        )
        upstream.raise_for_status()
        return jsonify(upstream.json()), upstream.status_code

    except requests.Timeout:
        logger.warning("BioBERT service timed out for /predict")
        return jsonify({
            "error": "UpstreamTimeout",
            "message": "BioBERT service did not respond in time.",
        }), 504

    except requests.ConnectionError:
        logger.error("BioBERT service is unreachable at %s", _BIOBERT_ENDPOINT)
        return jsonify({
            "error": "ServiceUnavailable",
            "message": "BioBERT service is unavailable.",
        }), 503

    except requests.RequestException as exc:
        logger.exception("BioBERT request failed in /predict: %s", exc)
        status = exc.response.status_code if exc.response is not None else 502
        return jsonify({
            "error": "UpstreamError",
            "message": "BioBERT service returned an error.",
        }), status

    except Exception as exc:
        logger.exception("Unexpected error in /predict: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Unexpected server error."}), 500
