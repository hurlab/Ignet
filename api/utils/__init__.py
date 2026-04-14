"""Shared utilities for the Ignet REST API."""

# Re-export sanitize_gene_symbol so existing imports keep working:
#   from utils import sanitize_gene_symbol
from utils.gene import sanitize_gene_symbol

__all__ = ["sanitize_gene_symbol"]
