"""Gene pairs must be canonicalised before grouping.

t_gene_pairs stores a sentence-level row with the two genes in one orientation,
and the same pair occurs in both orientations across rows. Grouping on the raw
columns therefore splits every pair in two: the Enrichment page listed
IFNG->TNF (3264) and TNF->IFNG (3317) as separate interactions, where
/pairs/IFNG/TNF reports the single true total of 6581.

Two failure modes follow from the same root cause, and both are covered here:

  * no canonicalisation at all -> the pair appears twice, each row carrying
    only part of the evidence (enrichment, mcp, ino);
  * a `gene_symbol1 < gene_symbol2` filter -> one row, but the rows in the
    other orientation are discarded rather than merged, so the count is short
    by however many sentences happened to be stored the other way (vaccine).

LEAST/GREATEST fixes both: it folds the two orientations onto one key instead
of dropping either.
"""
import pathlib
import re

import pytest

from routes.enrichment import _enrichment_sections

ROUTES = pathlib.Path(__file__).resolve().parents[1] / "routes"


class RecordingCursor:
    """Like the fake in test_enrichment_sections, but keeps the whole SQL."""

    def __init__(self, result_sets):
        self._results = list(result_sets)
        self.sql = []
        self.closed = False

    def execute(self, sql, params=None):
        self.sql.append(sql)

    def fetchall(self):
        return self._results.pop(0)

    def close(self):
        self.closed = True


class RecordingConn:
    def __init__(self, result_sets):
        self.cursor_obj = RecordingCursor(result_sets)

    def cursor(self, dictionary=False):
        return self.cursor_obj


def test_enrichment_groups_on_canonical_pair_order():
    conn = RecordingConn([[], [], [], []])
    list(_enrichment_sections(conn, ["IFNG", "TNF"]))

    grouping = [s for s in conn.cursor_obj.sql if "GROUP BY" in s.upper()]
    pair_sql = [s for s in grouping if "gene_symbol" in s]
    assert pair_sql, "expected a query grouping gene pairs"

    for sql in pair_sql:
        upper = sql.upper()
        assert "LEAST(" in upper and "GREATEST(" in upper, (
            "pair grouping must canonicalise orientation, otherwise (A,B) and "
            f"(B,A) are counted as two interactions:\n{sql}"
        )


# Every route that groups gene pairs, and the reason each one matters.
_PAIR_GROUPERS = [
    ("enrichment.py", "Enrichment page + Analysis Report"),
    ("mcp.py", "MCP tool -> AI assistants"),
    ("ino.py", "INO Explorer pair list"),
    ("vaccine.py", "VacNet gene-gene edge weights"),
]


@pytest.mark.parametrize("filename,surface", _PAIR_GROUPERS)
def test_route_canonicalises_pair_grouping(filename, surface):
    """Guard every known pair-grouping site, not just the one that was reported.

    Matches `GROUP BY ... gene_symbol1, gene_symbol2` and requires the SELECT
    feeding it to canonicalise. A `gene_symbol1 < gene_symbol2` filter does not
    satisfy this: it de-duplicates the display while dropping half the rows.
    """
    src = (ROUTES / filename).read_text()

    for m in re.finditer(r"GROUP BY[^;\"']*?gene_symbol1\s*,\s*(?:\w+\.)?gene_symbol2",
                         src, re.IGNORECASE):
        # Look back to the SELECT that owns this GROUP BY.
        head = src[max(0, m.start() - 900):m.start()].upper()
        select = head.rfind("SELECT")
        assert select != -1, f"{filename}: GROUP BY with no SELECT above it"
        assert "LEAST(" in head[select:] and "GREATEST(" in head[select:], (
            f"{filename} ({surface}): groups gene pairs without LEAST/GREATEST, "
            "so (A,B) and (B,A) do not merge"
        )
