"""Local pathway over-representation analysis (GO / KEGG / Reactome).

Self-contained: gene-set libraries are bundled as gzipped GMT files under
data/genesets/ and the hypergeometric test + Benjamini-Hochberg FDR are computed
in-process (pure Python, no scipy). No external service is called at runtime.

Background model: for each library the universe is the union of all genes that
appear in any of its terms (the "annotated background"). p-values are the upper
tail of the hypergeometric distribution:

    P(X >= k) with  M = |universe|, n = |term|, N = |query ∩ universe|, k = overlap

which is the standard one-sided over-representation test used by Enrichr.
"""

import gzip
import math
import os
import threading

_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "genesets")

# Display name -> GMT file. Order is the order shown to the client.
LIBRARIES = {
    "GO_Biological_Process": "GO_Biological_Process.gmt.gz",
    "KEGG": "KEGG.gmt.gz",
    "Reactome": "Reactome.gmt.gz",
}

# Lazy, process-wide cache of parsed libraries: name -> {"terms": {term: frozenset},
# "universe": frozenset}. Guarded so concurrent first-hits don't double-parse.
_cache = {}
_cache_lock = threading.Lock()


def _parse_gmt(path):
    """Parse a (gzipped) GMT file into {term: frozenset(genes)} plus the universe."""
    terms = {}
    universe = set()
    with gzip.open(path, "rt", encoding="utf-8") as fh:
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            term = parts[0].strip()
            # parts[1] is an unused description field; genes start at index 2.
            genes = {g.strip().upper() for g in parts[2:] if g.strip()}
            if not term or not genes:
                continue
            terms[term] = frozenset(genes)
            universe |= genes
    return {"terms": terms, "universe": frozenset(universe)}


def load_library(name):
    """Return the parsed library, loading + caching it on first use."""
    cached = _cache.get(name)
    if cached is not None:
        return cached
    with _cache_lock:
        cached = _cache.get(name)
        if cached is not None:
            return cached
        fname = LIBRARIES.get(name)
        if not fname:
            raise KeyError(f"Unknown library: {name}")
        parsed = _parse_gmt(os.path.join(_DATA_DIR, fname))
        _cache[name] = parsed
        return parsed


def _log_choose(n, k):
    """log(C(n, k)) via lgamma — stable for the large counts here."""
    if k < 0 or k > n:
        return float("-inf")
    return math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)


def hypergeom_sf(k, M, n, N):
    """Upper-tail hypergeometric probability P(X >= k).

    M = population size, n = successes in population (term size),
    N = sample size (query size), k = observed successes (overlap).
    """
    if k <= 0:
        return 1.0
    upper = min(n, N)
    if k > upper:
        return 0.0
    log_denom = _log_choose(M, N)
    total = 0.0
    for i in range(k, upper + 1):
        log_p = _log_choose(n, i) + _log_choose(M - n, N - i) - log_denom
        total += math.exp(log_p)
    return min(1.0, total)


def _benjamini_hochberg(pvalues, m):
    """BH-adjusted p-values for `pvalues` (already ascending), tested against m
    total hypotheses. Returns adjusted values in the same order, monotone."""
    adj = [0.0] * len(pvalues)
    prev = 1.0
    # Walk from least significant to most, enforcing monotonicity.
    for idx in range(len(pvalues) - 1, -1, -1):
        rank = idx + 1
        val = min(prev, pvalues[idx] * m / rank)
        adj[idx] = val
        prev = val
    return adj


def analyze_pathways(genes, libraries=None, top_n=25):
    """Run over-representation analysis for the requested libraries.

    Returns {library_name: [ {term, overlap, term_size, query_size, genes,
    pvalue, adj_pvalue}, ... ]} sorted by p-value, capped to top_n per library.
    """
    query = {g.strip().upper() for g in genes if g and g.strip()}
    libs = libraries or list(LIBRARIES.keys())
    out = {}
    for name in libs:
        if name not in LIBRARIES:
            continue
        lib = load_library(name)
        universe = lib["universe"]
        terms = lib["terms"]
        M = len(universe)
        query_in = query & universe
        N = len(query_in)
        results = []
        if N == 0 or M == 0:
            out[name] = []
            continue
        m_tests = len(terms)
        for term, term_genes in terms.items():
            overlap = query_in & term_genes
            k = len(overlap)
            if k == 0:
                continue
            p = hypergeom_sf(k, M, len(term_genes), N)
            results.append({
                "term": term,
                "overlap": k,
                "term_size": len(term_genes),
                "query_size": N,
                "genes": sorted(overlap),
                "pvalue": p,
            })
        results.sort(key=lambda r: (r["pvalue"], -r["overlap"]))
        adj = _benjamini_hochberg([r["pvalue"] for r in results], m_tests)
        for r, a in zip(results, adj):
            r["adj_pvalue"] = a
        out[name] = results[:top_n]
    return out
