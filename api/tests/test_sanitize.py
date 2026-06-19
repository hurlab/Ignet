"""Tests for sanitize_gene_symbol — the input gate every gene query relies on."""
import pytest

from utils import sanitize_gene_symbol


@pytest.mark.parametrize("raw,expected", [
    ("TP53", "TP53"),
    ("tp53", "TP53"),        # uppercased
    ("  BRCA1  ", "BRCA1"),  # trimmed
    ("HLA-DRB1", "HLA-DRB1"),  # hyphen allowed
    ("NKX2-1", "NKX2-1"),
    ("C1orf112", "C1ORF112"),
    ("MT-CO1", "MT-CO1"),
])
def test_valid_symbols(raw, expected):
    assert sanitize_gene_symbol(raw) == expected


@pytest.mark.parametrize("raw", [
    "",            # empty
    "   ",         # whitespace only
    "TP53; DROP",  # space + semicolon (SQL-injection shape)
    "BRCA1'",      # quote
    "a b",         # internal space
    "gene<script>",
    "x" * 61,      # too long (>60)
])
def test_invalid_symbols_return_none(raw):
    assert sanitize_gene_symbol(raw) is None
