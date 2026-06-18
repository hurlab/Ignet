"""Gene Set Enrichment endpoints."""
import hashlib
import json
import logging

from flask import Blueprint, Response, jsonify, request, stream_with_context

from db import db_connection, get_redis
from utils import sanitize_gene_symbol

logger = logging.getLogger(__name__)
enrichment_bp = Blueprint("enrichment", __name__)

# Results are derived from co-occurrence data that refreshes at most daily, so a
# 24h cache is safe. The example gene set (and any repeated query) then returns
# instantly without touching the database.
_CACHE_TTL = 86400
_CACHE_VERSION = "v1"

# Ordered section names streamed to the client (drives the progress indicator).
_STAGES = ["interactions", "ino_distribution", "drugs", "diseases"]


def _cache_key(genes):
    """Content-addressed key: order-independent, deduplicated gene set."""
    norm = ",".join(sorted(set(genes)))
    digest = hashlib.sha1(norm.encode("utf-8")).hexdigest()
    return f"enrichment:{_CACHE_VERSION}:{digest}"


def _extract_genes(body):
    """
    Validate the request body and return (genes, error_tuple).
    On success error_tuple is None; on failure genes is None and error_tuple is
    (payload_dict, status_code).
    """
    if not body or "genes" not in body:
        return None, ({"error": "MissingParameter", "message": "Provide 'genes' array."}, 400)

    raw_genes = body["genes"]
    if not isinstance(raw_genes, list) or len(raw_genes) < 2:
        return None, ({"error": "InvalidInput", "message": "Provide at least 2 genes."}, 400)
    if len(raw_genes) > 500:
        return None, ({"error": "InvalidInput", "message": "Maximum 500 genes."}, 400)

    genes = [sanitize_gene_symbol(g) for g in raw_genes if g]
    genes = [g for g in genes if g]
    if len(genes) < 2:
        return None, ({"error": "InvalidInput", "message": "At least 2 valid gene symbols required."}, 400)

    return genes, None


def _enrichment_sections(conn, genes):
    """
    Generator that runs the enrichment queries on a single connection, yielding
    each section as soon as it is ready, then a final assembled result.

    Yields:
      ("section", name, data, meta)  -- meta is a dict for 'interactions', else None
      ("result", full_result_dict)   -- emitted last

    Materializes the matched gene-pair rows ONCE into a session-scoped temporary
    table, then derives all four result sets from it (one filtered scan of the
    5.4M-row t_gene_pairs table instead of four). DROP IF EXISTS guards against a
    leftover table on a reused pooled connection.
    """
    cursor = conn.cursor(dictionary=True)
    placeholders = ",".join(["%s"] * len(genes))
    params = tuple(genes) + tuple(genes)

    cursor.execute("DROP TEMPORARY TABLE IF EXISTS tmp_enrich")
    cursor.execute(f"""
        CREATE TEMPORARY TABLE tmp_enrich (INDEX(pmid), INDEX(sentence_id)) AS
        SELECT pmid, sentence_id, gene_symbol1, gene_symbol2, score
        FROM t_gene_pairs
        WHERE gene_symbol1 IN ({placeholders}) AND gene_symbol2 IN ({placeholders})
    """, params)

    # 1. Pairwise interactions among the input genes
    cursor.execute("""
        SELECT gene_symbol1 AS gene1, gene_symbol2 AS gene2,
               COUNT(*) AS evidence_count, COUNT(DISTINCT pmid) AS unique_pmids,
               CAST(MAX(score) AS DOUBLE) AS max_score
        FROM tmp_enrich
        GROUP BY gene_symbol1, gene_symbol2
    """)
    interactions = cursor.fetchall()
    found_genes = set()
    for i in interactions:
        found_genes.add(i["gene1"])
        found_genes.add(i["gene2"])
    coverage = len(found_genes)
    meta = {
        "coverage": coverage,
        "coverage_pct": round(coverage / len(genes) * 100, 1) if genes else 0,
        "total_interactions": len(interactions),
    }
    yield ("section", "interactions", interactions, meta)

    # 2. INO distribution for these interactions
    cursor.execute("""
        SELECT ino.matching_phrase AS term, COUNT(*) AS cnt
        FROM tmp_enrich h
        JOIN t_ino ino ON ino.sentence_id = h.sentence_id
        GROUP BY ino.matching_phrase ORDER BY cnt DESC LIMIT 20
    """)
    ino_distribution = [dict(r) for r in cursor.fetchall()]
    yield ("section", "ino_distribution", ino_distribution, None)

    # 3. Drug associations
    cursor.execute("""
        SELECT b.drug_term AS term, COUNT(*) AS cnt
        FROM tmp_enrich h
        JOIN t_biosummary b ON b.pmid = h.pmid
        WHERE b.drug_term IS NOT NULL AND b.drug_term != ''
        GROUP BY b.drug_term ORDER BY cnt DESC LIMIT 20
    """)
    drugs = [dict(r) for r in cursor.fetchall()]
    yield ("section", "drugs", drugs, None)

    # 4. Disease associations
    cursor.execute("""
        SELECT b.hdo_term AS term, COUNT(*) AS cnt
        FROM tmp_enrich h
        JOIN t_biosummary b ON b.pmid = h.pmid
        WHERE b.hdo_term IS NOT NULL AND b.hdo_term != ''
        GROUP BY b.hdo_term ORDER BY cnt DESC LIMIT 20
    """)
    diseases = [dict(r) for r in cursor.fetchall()]
    yield ("section", "diseases", diseases, None)

    cursor.execute("DROP TEMPORARY TABLE IF EXISTS tmp_enrich")
    cursor.close()

    yield ("result", {
        "input_genes": genes,
        "coverage": meta["coverage"],
        "coverage_pct": meta["coverage_pct"],
        "interactions": interactions,
        "total_interactions": meta["total_interactions"],
        "ino_distribution": ino_distribution,
        "drugs": drugs,
        "diseases": diseases,
    })


def _section_event_from_result(result, name):
    """Build a stream 'section' event dict from a (cached) full result."""
    if name == "interactions":
        return {
            "type": "section", "name": "interactions",
            "data": result["interactions"],
            "meta": {
                "coverage": result["coverage"],
                "coverage_pct": result["coverage_pct"],
                "total_interactions": result["total_interactions"],
            },
        }
    return {"type": "section", "name": name, "data": result.get(name, [])}


@enrichment_bp.route("/enrichment/analyze", methods=["POST"])
def analyze_gene_set():
    """
    Analyze a set of genes for pairwise interactions, INO distribution,
    drug associations, and disease associations. Returns one JSON object.

    Request body:
      genes - list of gene symbols (2-500)
    """
    genes, err = _extract_genes(request.get_json(silent=True))
    if err:
        payload, status = err
        return jsonify(payload), status

    redis_client = get_redis()
    cache_key = _cache_key(genes)
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return jsonify(json.loads(cached))
        except Exception as exc:  # noqa: BLE001 - cache must never break the request
            logger.warning("Enrichment cache read failed: %s", exc)

    try:
        with db_connection() as conn:
            result = None
            for item in _enrichment_sections(conn, genes):
                if item[0] == "result":
                    result = item[1]
    except Exception as exc:
        logger.exception("Error in enrichment: %s", exc)
        return jsonify({"error": "DatabaseError"}), 500

    if redis_client and result is not None:
        try:
            redis_client.set(cache_key, json.dumps(result), ex=_CACHE_TTL)
        except Exception as exc:  # noqa: BLE001 - cache write must never break the request
            logger.warning("Enrichment cache write failed: %s", exc)

    return jsonify(result)


@enrichment_bp.route("/enrichment/analyze/stream", methods=["POST"])
def analyze_gene_set_stream():
    """
    Streaming variant of /enrichment/analyze. Emits newline-delimited JSON
    (application/x-ndjson), one object per line, so the client can render each
    section as it completes instead of waiting for the whole analysis:

      {"type":"start","stages":[...],"input_genes":[...]}
      {"type":"section","name":"interactions","data":[...],"meta":{...}}
      {"type":"section","name":"ino_distribution","data":[...]}
      {"type":"section","name":"drugs","data":[...]}
      {"type":"section","name":"diseases","data":[...]}
      {"type":"done"}
      {"type":"error","message":"..."}   (on failure)

    Cached results stream every section immediately, then done.
    """
    genes, err = _extract_genes(request.get_json(silent=True))
    if err:
        payload, status = err
        return jsonify(payload), status

    def event(obj):
        return json.dumps(obj) + "\n"

    def generate():
        try:
            yield event({"type": "start", "stages": _STAGES, "input_genes": genes})

            redis_client = get_redis()
            cache_key = _cache_key(genes)
            if redis_client:
                try:
                    cached = redis_client.get(cache_key)
                    if cached:
                        result = json.loads(cached)
                        for name in _STAGES:
                            yield event(_section_event_from_result(result, name))
                        yield event({"type": "done"})
                        return
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Enrichment cache read failed: %s", exc)

            result = None
            with db_connection() as conn:
                for item in _enrichment_sections(conn, genes):
                    if item[0] == "section":
                        _, name, data, meta = item
                        evt = {"type": "section", "name": name, "data": data}
                        if meta:
                            evt["meta"] = meta
                        yield event(evt)
                    else:
                        result = item[1]

            if redis_client and result is not None:
                try:
                    redis_client.set(cache_key, json.dumps(result), ex=_CACHE_TTL)
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Enrichment cache write failed: %s", exc)

            yield event({"type": "done"})
        except Exception as exc:  # noqa: BLE001 - report failure inside the stream
            logger.exception("Error in enrichment stream: %s", exc)
            yield event({"type": "error", "message": "Analysis failed. Please try again."})

    headers = {
        "X-Accel-Buffering": "no",   # disable proxy buffering (nginx); harmless elsewhere
        "Cache-Control": "no-cache",
    }
    return Response(stream_with_context(generate()), mimetype="application/x-ndjson", headers=headers)
