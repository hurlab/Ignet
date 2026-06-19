"""Tests for the _enrichment_sections generator using a fake DB connection.

Verifies the contract the streaming endpoint depends on: sections are yielded in
the fixed order, coverage_pct is computed against the (already de-duplicated)
input set, the final 'result' assembles every section, and the cursor is always
closed (the try/finally that guards a mid-stream client disconnect).
"""
from routes.enrichment import _enrichment_sections


class FakeCursor:
    """Returns canned result sets from fetchall() in call order."""

    def __init__(self, result_sets):
        self._results = list(result_sets)
        self.executed = []
        self.closed = False

    def execute(self, sql, params=None):
        self.executed.append(sql.strip().split(None, 2)[0].upper())

    def fetchall(self):
        return self._results.pop(0)

    def close(self):
        self.closed = True


class FakeConn:
    def __init__(self, result_sets):
        self.cursor_obj = FakeCursor(result_sets)

    def cursor(self, dictionary=False):
        return self.cursor_obj


def _drive(genes, result_sets):
    conn = FakeConn(result_sets)
    events = list(_enrichment_sections(conn, genes))
    return conn.cursor_obj, events


def test_sections_yielded_in_order_then_result():
    interactions = [
        {"gene1": "TP53", "gene2": "BRCA1", "evidence_count": 9,
         "unique_pmids": 7, "max_score": 0.99},
    ]
    cur, events = _drive(
        ["TP53", "BRCA1"],
        [interactions, [{"term": "expression", "cnt": 5}],
         [{"term": "cisplatin", "cnt": 3}], [{"term": "carcinoma", "cnt": 4}]],
    )
    section_names = [e[1] for e in events if e[0] == "section"]
    assert section_names == ["interactions", "ino_distribution", "drugs", "diseases"]
    assert events[-1][0] == "result"
    assert cur.closed is True


def test_coverage_pct_full():
    interactions = [{"gene1": "TP53", "gene2": "BRCA1", "evidence_count": 1,
                     "unique_pmids": 1, "max_score": 0.5}]
    _cur, events = _drive(["TP53", "BRCA1"], [interactions, [], [], []])
    meta = next(e[3] for e in events if e[0] == "section" and e[1] == "interactions")
    assert meta["coverage"] == 2
    assert meta["coverage_pct"] == 100.0


def test_coverage_pct_partial():
    # 3 input genes, only TP53/BRCA1 appear in interactions → 2/3 = 66.7
    interactions = [{"gene1": "TP53", "gene2": "BRCA1", "evidence_count": 1,
                     "unique_pmids": 1, "max_score": 0.5}]
    _cur, events = _drive(["TP53", "BRCA1", "EGFR"], [interactions, [], [], []])
    meta = next(e[3] for e in events if e[0] == "section" and e[1] == "interactions")
    assert meta["coverage"] == 2
    assert meta["coverage_pct"] == 66.7


def test_result_assembles_all_sections():
    interactions = [{"gene1": "TP53", "gene2": "BRCA1", "evidence_count": 1,
                     "unique_pmids": 1, "max_score": 0.5}]
    ino = [{"term": "expression", "cnt": 5}]
    drugs = [{"term": "cisplatin", "cnt": 3}]
    diseases = [{"term": "carcinoma", "cnt": 4}]
    _cur, events = _drive(["TP53", "BRCA1"], [interactions, ino, drugs, diseases])
    result = events[-1][1]
    assert result["input_genes"] == ["TP53", "BRCA1"]
    assert result["interactions"] == interactions
    assert result["ino_distribution"] == ino
    assert result["drugs"] == drugs
    assert result["diseases"] == diseases
    assert result["total_interactions"] == 1


def test_cursor_closed_on_early_generator_close():
    interactions = [{"gene1": "TP53", "gene2": "BRCA1", "evidence_count": 1,
                     "unique_pmids": 1, "max_score": 0.5}]
    conn = FakeConn([interactions, [], [], []])
    gen = _enrichment_sections(conn, ["TP53", "BRCA1"])
    next(gen)            # pull only the first section
    gen.close()          # simulate client disconnect mid-stream
    assert conn.cursor_obj.closed is True
