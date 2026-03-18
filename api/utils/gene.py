"""Gene symbol utilities for the Ignet REST API."""

import re

# Valid gene symbol: 1-60 chars, alphanumeric plus . _ -
_GENE_SYMBOL_RE = re.compile(r"^[A-Za-z0-9._-]{1,60}$")


def sanitize_gene_symbol(raw: str) -> str | None:
    """Return the cleaned gene symbol or None if invalid."""
    s = raw.strip().upper()
    if not s or not _GENE_SYMBOL_RE.match(s):
        return None
    return s
