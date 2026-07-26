"""Tests for INO ontology-class selection.

t_ino carries a real ontology id per annotation, but the endpoints grouped and
filtered on the raw matched phrase. One class spans many phrases -- INO_0000157
("regulation") covers 69 of them -- so phrase-level selection both fragmented
the term listing and retrieved only a sliver of a class's evidence.

These cover the id validation guarding the new ?ino_id= selector.
"""
import pytest

from routes.ino import _INO_ID_RE


@pytest.mark.parametrize(
    "ino_id",
    [
        "INO_0000157",   # Interaction Network Ontology
        "MI_0914",       # PSI Molecular Interactions
        "GO_0006468",    # Gene Ontology
        "INO_T000004",   # template artifact: valid shape, filtered elsewhere
    ],
)
def test_accepts_real_namespaces(ino_id):
    """All three ontologies present in t_ino must validate."""
    assert _INO_ID_RE.fullmatch(ino_id)


@pytest.mark.parametrize(
    "bad",
    [
        "INO_0000157' OR '1'='1",  # quote break-out
        "'; DROP TABLE t_ino; --",  # statement injection
        "INO 0000157",              # space
        "INO-0000157",              # wrong separator
        "regulation",               # a label, not an id
        "",                         # empty
        "INO_",                     # missing local part
    ],
)
def test_rejects_non_ids(bad):
    """Anything that is not <namespace>_<localpart> is refused."""
    assert not _INO_ID_RE.fullmatch(bad)


def test_fullmatch_not_search():
    """A valid id embedded in a larger string must not slip through."""
    assert not _INO_ID_RE.fullmatch("INO_0000157 UNION SELECT 1")
