"""Smart Literature Assistant — RAG-powered Q&A with cited PubMed sentences."""
import logging
import re
from flask import Blueprint, jsonify, request
from db import db_connection
from config import BIOSUMMARAI_URL
import requests as http_requests

logger = logging.getLogger(__name__)
assistant_bp = Blueprint("assistant", __name__)

_LLM_TIMEOUT = 120


def _extract_gene_symbols(text):
    """Extract potential gene symbols from natural language text."""
    candidates = re.findall(r'\b([A-Z][A-Z0-9]{1,9})\b', text)
    exclude = {
        'THE', 'AND', 'FOR', 'ARE', 'NOT', 'BUT', 'HAS', 'WAS', 'WITH',
        'FROM', 'THIS', 'THAT', 'WHAT', 'HOW', 'WHY', 'ALL', 'CAN',
        'DNA', 'RNA', 'PCR', 'MRI',
    }
    return [g for g in candidates if g not in exclude]


def _extract_keywords(text):
    """Extract non-gene keywords for context filtering."""
    words = re.findall(r'\b[a-z]{4,}\b', text.lower())
    stop = {
        'what', 'which', 'where', 'when', 'that', 'this', 'with', 'from',
        'have', 'been', 'does', 'about', 'between', 'their', 'there',
        'these', 'those', 'would', 'could', 'should',
    }
    return [w for w in words if w not in stop][:5]


@assistant_bp.route("/assistant/ask", methods=["POST"])
def ask():
    body = request.get_json(silent=True)
    if not body or "question" not in body:
        return jsonify({"error": "MissingParameter", "message": "Provide 'question'."}), 400

    question = body["question"].strip()
    conversation_history = body.get("conversation_history", [])

    if not question:
        return jsonify({"error": "InvalidInput", "message": "Question cannot be empty."}), 400

    # Step 1: Extract genes and keywords from the question
    genes = _extract_gene_symbols(question)
    keywords = _extract_keywords(question)

    # Step 2: Retrieve relevant evidence sentences
    evidence_sentences = []
    cited_pmids = set()

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            if genes:
                placeholders = ",".join(["%s"] * len(genes))
                kw_clause = ""
                kw_params = []
                if keywords:
                    kw_conditions = " OR ".join(["h.sentence LIKE %s"] * len(keywords))
                    kw_clause = f"AND ({kw_conditions})"
                    kw_params = [f"%{kw}%" for kw in keywords]

                cursor.execute(f"""
                    SELECT DISTINCT h.sentence, h.PMID, h.geneSymbol1, h.geneSymbol2, h.score
                    FROM t_sentence_hit_gene2gene_Host h
                    WHERE (h.geneSymbol1 IN ({placeholders}) OR h.geneSymbol2 IN ({placeholders}))
                    {kw_clause}
                    ORDER BY h.score DESC, h.PMID DESC
                    LIMIT 50
                """, tuple(genes) * 2 + tuple(kw_params))
                evidence_sentences = cursor.fetchall()
                cited_pmids = {str(s["PMID"]) for s in evidence_sentences if s.get("PMID")}

            cursor.close()
    except Exception as exc:
        logger.exception("Error retrieving evidence: %s", exc)

    # Step 3: Build GPT-4o prompt with evidence context
    evidence_text = "\n".join([
        f"[PMID:{s['PMID']}] {s['geneSymbol1']}-{s['geneSymbol2']}: {s['sentence']}"
        for s in evidence_sentences[:30]
    ]) if evidence_sentences else "No specific evidence found in the database for this query."

    system_prompt = (
        "You are a biomedical research assistant with access to the Ignet gene interaction database. "
        "Answer questions about gene interactions based on the evidence sentences provided. "
        "ALWAYS cite PMIDs when making claims. Format: (PMID:12345678). "
        "If the evidence doesn't support a claim, say so. Be concise and scientific."
    )

    user_prompt = f"""Question: {question}

Evidence from Ignet database ({len(evidence_sentences)} sentences found):
{evidence_text}

Please answer the question based on the evidence above. Cite specific PMIDs for each claim."""

    # Build conversation for GPT-4o
    messages = [{"role": "system", "content": system_prompt}]
    if conversation_history:
        messages.extend(conversation_history)
    messages.append({"role": "user", "content": user_prompt})

    # Step 4: Call BioSummarAI service (which proxies to GPT-4o)
    try:
        upstream = http_requests.post(
            f"{BIOSUMMARAI_URL}/biobert/",
            json={
                "conversation_history": messages,
                "prompt": user_prompt,
            },
            timeout=_LLM_TIMEOUT,
        )
        upstream.raise_for_status()
        llm_response = upstream.json()
        answer = llm_response.get("reply") or llm_response.get("response") or str(llm_response)
    except http_requests.Timeout:
        return jsonify({"error": "Timeout", "message": "AI service timed out."}), 504
    except Exception as exc:
        logger.exception("LLM error: %s", exc)
        return jsonify({"error": "LLMError", "message": "AI service unavailable."}), 502

    # Build updated conversation history
    new_history = messages + [{"role": "assistant", "content": answer}]

    return jsonify({
        "answer": answer,
        "cited_pmids": sorted(cited_pmids),
        "evidence_count": len(evidence_sentences),
        "genes_detected": genes,
        "keywords_detected": keywords,
        "evidence": [
            {"pmid": str(s["PMID"]), "gene1": s["geneSymbol1"], "gene2": s["geneSymbol2"],
             "sentence": s["sentence"], "score": s.get("score")}
            for s in evidence_sentences[:20]
        ],
        "conversation_history": new_history,
    })
