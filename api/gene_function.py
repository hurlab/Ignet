"""Functional-class gene annotation (SPEC-COHORT-001).

Maps gene symbols to a small set of coarse, curated functional-class buckets
derived from the already-bundled GMT libraries (see pathway_enrichment). The
map is built lazily once per process and cached. Deterministic and reproducible:
the bucket order, the representative terms, and the colors are all fixed here, so
the same gene always resolves to the same bucket and color.

Assignment is priority-ordered first-match-wins: buckets are evaluated top to
bottom and the first whose representative gene-sets contain a gene claims it;
genes matched by none resolve to "Other".
"""

import threading

from pathway_enrichment import load_library

# Bucket -> (library, [representative GMT term names]). ORDER IS SIGNIFICANT:
# more specific / biologically distinct classes come first so they win ties over
# broad catch-alls like Signaling or Metabolism. Terms not present in a library
# are skipped silently, so the curation is robust to library version drift.
_BUCKET_TERMS = [
    ("Immune & inflammation", "KEGG", ["Cytokine-cytokine receptor interaction"]),
    ("Immune & inflammation", "GO_Biological_Process",
     ["Inflammatory Response (GO:0006954)", "Immune Response (GO:0006955)",
      "Adaptive Immune Response (GO:0002250)", "Innate Immune Response (GO:0045087)"]),
    # Cell cycle uses ONLY the specific KEGG set (CDK/cyclin genes) and is ranked
    # above DNA repair: the broad GO "DNA Repair" set also contains checkpoint
    # genes like CDK1, so DNA repair must not claim them first. KEGG "Cell cycle"
    # excludes BRCA1/RAD51, which then correctly fall through to DNA repair.
    ("Cell cycle", "KEGG", ["Cell cycle"]),
    ("DNA repair", "GO_Biological_Process", ["DNA Repair (GO:0006281)"]),
    ("Apoptosis", "KEGG", ["Apoptosis"]),
    ("Apoptosis", "GO_Biological_Process", ["Apoptotic Process (GO:0006915)"]),
    ("Transcription & RNA", "KEGG", ["Spliceosome"]),
    ("Transcription & RNA", "GO_Biological_Process",
     ["Regulation Of Transcription By RNA Polymerase II (GO:0006357)"]),
    ("Translation", "KEGG", ["Ribosome"]),
    ("Proteostasis", "KEGG", ["Ubiquitin mediated proteolysis", "Proteasome"]),
    ("Metabolism", "KEGG", ["Oxidative phosphorylation"]),
    ("Metabolism", "GO_Biological_Process",
     ["Phosphate-Containing Compound Metabolic Process (GO:0006796)"]),
    ("Transport", "KEGG", ["ABC transporters"]),
    ("Transport", "GO_Biological_Process", ["Inorganic Cation Transmembrane Transport (GO:0098662)"]),
    ("Signaling", "KEGG",
     ["MAPK signaling pathway", "PI3K-Akt signaling pathway",
      "Calcium signaling pathway", "Wnt signaling pathway"]),
    ("Signaling", "GO_Biological_Process",
     ["Regulation Of Intracellular Signal Transduction (GO:1902531)"]),
    ("Development", "GO_Biological_Process",
     ["Nervous System Development (GO:0007399)", "Cell Differentiation (GO:0030154)"]),
]

# Display order of buckets (priority order, de-duplicated from _BUCKET_TERMS),
# with "Other" last. Colors are a fixed, color-blind-friendly-ish palette.
_BUCKET_ORDER = [
    "Immune & inflammation", "Cell cycle", "DNA repair", "Apoptosis",
    "Transcription & RNA", "Translation", "Proteostasis", "Metabolism",
    "Transport", "Signaling", "Development", "Other",
]
_BUCKET_COLORS = {
    "Immune & inflammation": "#e15759",
    "DNA repair": "#4e79a7",
    "Cell cycle": "#f28e2b",
    "Apoptosis": "#b07aa1",
    "Transcription & RNA": "#59a14f",
    "Translation": "#76b7b2",
    "Proteostasis": "#edc948",
    "Metabolism": "#9c755f",
    "Transport": "#ff9da7",
    "Signaling": "#af7aa1",
    "Development": "#bab0ac",
    "Other": "#c7c7c7",
}

_gene_map = None  # gene -> bucket, built lazily
_map_lock = threading.Lock()


def build_gene_map(ordered_buckets):
    """Build a {gene: bucket} map from an ordered list of (bucket, gene_set).

    First-match-wins: the first bucket (in list order) containing a gene claims
    it. Pure and side-effect free — the unit of the priority contract.
    """
    mapping = {}
    for bucket, genes in ordered_buckets:
        for g in genes:
            if g not in mapping:
                mapping[g] = bucket
    return mapping


def _ordered_buckets_from_gmt():
    """Resolve _BUCKET_TERMS into [(bucket, frozenset(genes))] in priority order."""
    ordered = []
    for bucket, lib_name, terms in _BUCKET_TERMS:
        lib = load_library(lib_name)
        genes = set()
        for term in terms:
            genes |= lib["terms"].get(term, frozenset())
        if genes:
            ordered.append((bucket, genes))
    return ordered


def _get_map():
    global _gene_map
    if _gene_map is not None:
        return _gene_map
    with _map_lock:
        if _gene_map is None:
            _gene_map = build_gene_map(_ordered_buckets_from_gmt())
        return _gene_map


def classify_genes(genes):
    """Return {gene: bucket} for each (upper-cased, de-duplicated) input gene."""
    gene_map = _get_map()
    out = {}
    for raw in genes:
        if not raw:
            continue
        g = raw.strip().upper()
        if g and g not in out:
            out[g] = gene_map.get(g, "Other")
    return out


def legend():
    """Ordered [{bucket, color}] for all buckets, 'Other' last."""
    return [{"bucket": b, "color": _BUCKET_COLORS[b]} for b in _BUCKET_ORDER]
