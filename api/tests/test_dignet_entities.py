"""Tests for the Dignet entity aggregation helpers.

Covers the two correctness properties the entities endpoint depends on:

1. Mined term fields are comma-joined lists, so terms must be split before
   counting (grouping on the raw column counted "cancer, lung cancer" as one
   distinct term).
2. Counting spans the FULL PMID cohort via chunking, not a leading subset, and
   per-chunk DISTINCT-pmid counts sum across chunks.
"""
from routes.dignet import (
    _ENTNET_TOP_GENES,
    _PMID_CHUNK,
    _aggregate_entities,
    _aggregate_entity_network,
    _aggregate_ino,
    _entity_cache_key,
    _split_terms,
)


class FakeCursor:
    """Serves canned result sets in call order and records the SQL it saw."""

    def __init__(self, owner):
        self._owner = owner
        self.closed = False

    def execute(self, sql, params=None):
        self._owner.executed.append((sql, tuple(params or ())))

    def fetchall(self):
        return self._owner.results.pop(0)

    def close(self):
        self.closed = True


class FakeConn:
    def __init__(self, results):
        self.results = list(results)
        self.executed = []
        self.cursors = []

    def cursor(self, dictionary=False):
        cur = FakeCursor(self)
        self.cursors.append(cur)
        return cur


# ---------------------------------------------------------------------------
# _split_terms
# ---------------------------------------------------------------------------


def test_split_terms_handles_empty_values():
    assert _split_terms(None) == []
    assert _split_terms("") == []


def test_split_terms_single_term():
    assert _split_terms("cancer") == ["cancer"]


def test_split_terms_splits_comma_joined_list():
    assert _split_terms("cancer, lung cancer, pneumonia") == [
        "cancer",
        "lung cancer",
        "pneumonia",
    ]


def test_split_terms_strips_blanks_and_whitespace():
    assert _split_terms("a,,  b ,") == ["a", "b"]


# ---------------------------------------------------------------------------
# _entity_cache_key
# ---------------------------------------------------------------------------


def test_cache_key_is_order_independent():
    assert _entity_cache_key([3, 1, 2]) == _entity_cache_key([1, 2, 3])


def test_cache_key_differs_for_different_cohorts():
    assert _entity_cache_key([1, 2, 3]) != _entity_cache_key([1, 2, 4])


def test_cache_key_separates_main_from_ino_scope():
    """The eager payload and the on-demand INO payload cache independently."""
    assert _entity_cache_key([1, 2], "main") != _entity_cache_key([1, 2], "ino")


# ---------------------------------------------------------------------------
# _aggregate_entities
# ---------------------------------------------------------------------------


def test_aggregate_splits_terms_and_counts_papers():
    """Each biosummary row is one paper; a comma-joined field counts per term."""
    conn = FakeConn([
        # t_biosummary rows: (drug_term, hdo_term)
        [
            ("aspirin", "cancer, lung cancer"),
            ("aspirin, ibuprofen", "cancer"),
            (None, None),
        ],
        # t_vo rows: (matching_phrase, distinct-pmid count)
        [("covid-19 vaccine", 2)],
    ])

    drugs, diseases, vaccines = _aggregate_entities(conn, [1, 2, 3])

    assert drugs == [{"term": "aspirin", "cnt": 2}, {"term": "ibuprofen", "cnt": 1}]
    assert diseases == [
        {"term": "cancer", "cnt": 2},
        {"term": "lung cancer", "cnt": 1},
    ]
    assert vaccines == [{"term": "covid-19 vaccine", "cnt": 2}]


def test_aggregate_drops_the_generic_vaccine_term():
    """The bare "vaccine" catch-all carries no cohort-specific signal."""
    conn = FakeConn([
        [],
        [("vaccine", 900), ("Vaccine", 50), ("malaria vaccine", 7)],
    ])

    _, _, vaccines = _aggregate_entities(conn, [1])

    assert vaccines == [{"term": "malaria vaccine", "cnt": 7}]


def test_aggregate_covers_every_chunk_not_just_the_first():
    """Regression: counts must span the whole cohort, not a leading subset."""
    pmids = list(range(1, _PMID_CHUNK * 2 + 1))  # exactly two chunks
    conn = FakeConn([
        [("aspirin", "cancer")],        # chunk 1 biosummary
        [("bcg vaccine", 5)],           # chunk 1 vo
        [("aspirin", "cancer")],        # chunk 2 biosummary
        [("bcg vaccine", 7)],           # chunk 2 vo
    ])

    drugs, diseases, vaccines = _aggregate_entities(conn, pmids)

    # Both chunks contributed, so counts are summed across the full cohort.
    assert drugs == [{"term": "aspirin", "cnt": 2}]
    assert diseases == [{"term": "cancer", "cnt": 2}]
    assert vaccines == [{"term": "bcg vaccine", "cnt": 12}]
    # 2 chunks x 2 queries (biosummary + vo)
    assert len(conn.executed) == 4


def test_aggregate_entities_does_not_touch_ino():
    """INO is expensive and must not ride along on the eager payload."""
    conn = FakeConn([[], []])

    _aggregate_entities(conn, [1, 2])

    assert not any("t_ino" in sql for sql, _ in conn.executed)


def test_aggregate_closes_every_cursor():
    conn = FakeConn([[], []])

    _aggregate_entities(conn, [1])

    assert conn.cursors and all(c.closed for c in conn.cursors)


def test_aggregate_empty_cohort_runs_no_queries():
    conn = FakeConn([])

    drugs, diseases, vaccines = _aggregate_entities(conn, [])

    assert (drugs, diseases, vaccines) == ([], [], [])
    assert conn.executed == []


# ---------------------------------------------------------------------------
# _aggregate_ino
# ---------------------------------------------------------------------------


def test_aggregate_ino_does_not_join_gene_pairs():
    """INO must read t_ino by pmid, not through t_gene_pairs.

    Joining through t_gene_pairs would silently require two genes in one
    sentence, dropping interaction evidence from single-gene papers.
    """
    conn = FakeConn([[("binding", 1)]])

    _aggregate_ino(conn, [1, 2])

    sql = conn.executed[0][0]
    assert "t_ino" in sql
    assert "t_gene_pairs" not in sql


def test_aggregate_ino_sums_across_chunks():
    pmids = list(range(1, _PMID_CHUNK * 2 + 1))
    conn = FakeConn([[("binding", 5)], [("binding", 7)]])

    assert _aggregate_ino(conn, pmids) == [{"term": "binding", "cnt": 12}]


def test_aggregate_ino_empty_cohort_runs_no_queries():
    conn = FakeConn([])

    assert _aggregate_ino(conn, []) == []
    assert conn.executed == []


# ---------------------------------------------------------------------------
# _aggregate_entity_network  (gene <-> ontology model)
# ---------------------------------------------------------------------------


def _edge(result, gene, term):
    for e in result["edges"]:
        if e["gene"] == gene and e["term"] == term:
            return e
    return None


def test_entity_network_counts_papers_per_gene_term_pair():
    """Edge weight is the number of papers co-mentioning the gene and term."""
    conn = FakeConn([[
        ("TP53, BRCA1", "breast cancer", None),
        ("TP53", "breast cancer", "cisplatin"),
    ]])

    result = _aggregate_entity_network(conn, [1, 2])

    assert _edge(result, "TP53", "breast cancer")["papers"] == 2
    assert _edge(result, "BRCA1", "breast cancer")["papers"] == 1
    assert _edge(result, "TP53", "cisplatin")["papers"] == 1
    assert result["papers_with_entities"] == 2


def test_entity_network_includes_single_gene_papers():
    """The whole point: a one-gene paper yields no gene-gene edge but does
    yield gene<->ontology evidence."""
    conn = FakeConn([[("PTEN", "glioma", None)]])

    result = _aggregate_entity_network(conn, [1])

    assert _edge(result, "PTEN", "glioma")["papers"] == 1


def test_entity_network_tags_edge_kind():
    conn = FakeConn([[("TP53", "breast cancer", "cisplatin")]])

    result = _aggregate_entity_network(conn, [1])

    assert _edge(result, "TP53", "breast cancer")["kind"] == "disease"
    assert _edge(result, "TP53", "cisplatin")["kind"] == "drug"


def test_entity_network_drops_generic_disease_terms():
    """"disease"/"syndrome" are classifiers, not findings; "cancer" is kept."""
    conn = FakeConn([[("TP53", "disease, syndrome, disorder, cancer", None)]])

    result = _aggregate_entity_network(conn, [1])

    terms = {e["term"] for e in result["edges"]}
    assert terms == {"cancer"}


def test_entity_network_skips_rows_without_genes():
    conn = FakeConn([[(None, "cancer", "aspirin"), ("", "cancer", None)]])

    result = _aggregate_entity_network(conn, [1])

    assert result["edges"] == []
    assert result["papers_with_entities"] == 0


def test_entity_network_caps_gene_count():
    """Gene space is bounded so the pair space cannot blow up on big cohorts."""
    many = ", ".join(f"GENE{i}" for i in range(_ENTNET_TOP_GENES + 25))
    conn = FakeConn([[(many, "cancer", None)]])

    result = _aggregate_entity_network(conn, [1])

    assert result["gene_count"] == _ENTNET_TOP_GENES
    assert len(result["edges"]) == _ENTNET_TOP_GENES


def test_entity_network_terms_match_edges():
    conn = FakeConn([[("TP53", "breast cancer", "cisplatin")]])

    result = _aggregate_entity_network(conn, [1])

    assert {t["term"] for t in result["terms"]} == {e["term"] for e in result["edges"]}


def test_entity_network_emits_no_vaccine_edges():
    """Vaccine edges are deliberately excluded from this model.

    Measured on the live DB: of 3,000 sampled t_vo PMIDs only 22 appear in
    t_biosummary and 3 in t_gene_pairs, so the VO corpus and the gene-annotation
    corpus are near-disjoint. A per-paper gene<->vaccine join would render an
    almost always empty category. Vaccine term FREQUENCIES are unaffected (they
    need no gene join) and corpus-wide vaccine<->gene links are served from
    t_cooccurrence_vo_gene by routes/vaccine.py.
    """
    conn = FakeConn([[("IFNG", "influenza", "adjuvant")]])

    result = _aggregate_entity_network(conn, [1])

    assert {e["kind"] for e in result["edges"]} <= {"disease", "drug"}
    assert not any("t_vo" in sql for sql, _ in conn.executed)


def test_entity_network_empty_cohort_runs_no_queries():
    conn = FakeConn([])

    result = _aggregate_entity_network(conn, [])

    assert result["edges"] == [] and result["terms"] == []
    assert conn.executed == []
