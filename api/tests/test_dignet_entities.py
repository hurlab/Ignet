"""Tests for the Dignet entity aggregation helpers.

Covers the two correctness properties the entities endpoint depends on:

1. Mined term fields are comma-joined lists, so terms must be split before
   counting (grouping on the raw column counted "cancer, lung cancer" as one
   distinct term).
2. Counting spans the FULL PMID cohort via chunking, not a leading subset, and
   per-chunk DISTINCT-pmid counts sum across chunks.
"""
from routes.dignet import (
    _PMID_CHUNK,
    _aggregate_entities,
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
