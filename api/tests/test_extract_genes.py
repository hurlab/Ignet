"""Tests for _extract_genes — validation + de-duplication of the enrichment body.

The de-dup case is a regression guard: a duplicate gene used to inflate the
coverage_pct denominator (["TP53","TP53","BRCA1"] reported 66.7% instead of
100%). Fixed 2026-06-18; this locks it.
"""
from routes.enrichment import _cache_key, _extract_genes


def test_missing_genes_key():
    genes, err = _extract_genes({})
    assert genes is None
    assert err[1] == 400


def test_genes_not_a_list():
    genes, err = _extract_genes({"genes": "TP53"})
    assert genes is None
    assert err[1] == 400


def test_fewer_than_two_genes():
    genes, err = _extract_genes({"genes": ["TP53"]})
    assert genes is None
    assert err[1] == 400


def test_more_than_500_genes():
    genes, err = _extract_genes({"genes": [f"GENE{i}" for i in range(501)]})
    assert genes is None
    assert err[1] == 400


def test_dedup_preserves_order_and_distinct_set():
    genes, err = _extract_genes({"genes": ["TP53", "TP53", "BRCA1"]})
    assert err is None
    assert genes == ["TP53", "BRCA1"]  # de-duplicated, order preserved


def test_dedup_case_insensitive():
    # sanitize uppercases first, so "tp53" and "TP53" collapse to one
    genes, err = _extract_genes({"genes": ["tp53", "TP53", "brca1"]})
    assert err is None
    assert genes == ["TP53", "BRCA1"]


def test_invalid_symbols_filtered_then_too_few():
    genes, err = _extract_genes({"genes": ["TP53", "bad;symbol"]})
    assert genes is None
    assert err[1] == 400  # only 1 valid symbol survives


def test_falsy_entries_skipped():
    genes, err = _extract_genes({"genes": ["TP53", "", None, "BRCA1"]})
    assert err is None
    assert genes == ["TP53", "BRCA1"]


def test_cache_key_is_order_and_dup_independent():
    k1 = _cache_key(["TP53", "BRCA1"])
    k2 = _cache_key(["BRCA1", "TP53", "TP53"])
    assert k1 == k2
    # different content → different key
    assert _cache_key(["TP53", "EGFR"]) != k1
