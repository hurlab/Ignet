"""SPEC-COHORT-001 — unit tests for the functional-class annotation core.

These exercise gene_function directly (no Flask). The classifier is built from
the bundled GMT libraries via pathway_enrichment, so no external service or DB.
"""
import gene_function as gf


def test_classify_is_deterministic():
    """AC1: identical input → identical output across repeated calls."""
    genes = ["IL6", "TNF", "CDK1", "BRCA1", "ZZZ_NOT_A_GENE"]
    first = gf.classify_genes(genes)
    second = gf.classify_genes(genes)
    assert first == second


def test_marker_genes_land_in_expected_buckets():
    """AC2: known markers map to their expected functional class."""
    res = gf.classify_genes(["IL6", "TNF", "CXCL8", "CDK1", "CCNB1", "BRCA1", "RAD51"])
    assert res["IL6"] == "Immune & inflammation"
    assert res["TNF"] == "Immune & inflammation"
    assert res["CXCL8"] == "Immune & inflammation"
    assert res["CDK1"] == "Cell cycle"
    assert res["CCNB1"] == "Cell cycle"
    assert res["BRCA1"] == "DNA repair"
    assert res["RAD51"] == "DNA repair"


def test_unmatched_gene_is_other():
    """AC3: a symbol in no representative term resolves to 'Other'."""
    res = gf.classify_genes(["ZZZ_NOT_A_GENE_123"])
    assert res["ZZZ_NOT_A_GENE_123"] == "Other"


def test_every_input_gene_is_classified():
    """AC5 (core): every queried gene appears in the result."""
    genes = ["IL6", "BRCA1", "FOOBAR", "tp53"]  # mixed case + unknown
    res = gf.classify_genes(genes)
    # input is upper-cased + de-duplicated by the classifier
    for g in ["IL6", "BRCA1", "FOOBAR", "TP53"]:
        assert g in res


def test_first_match_wins_priority():
    """AC4: a gene in multiple buckets is assigned to the highest-priority one.
    Tested on the pure assignment helper with injected, ordered gene sets."""
    ordered = [
        ("First", {"SHARED", "ONLY_FIRST"}),
        ("Second", {"SHARED", "ONLY_SECOND"}),
    ]
    mapping = gf.build_gene_map(ordered)
    assert mapping["SHARED"] == "First"        # first-match-wins
    assert mapping["ONLY_SECOND"] == "Second"
    assert mapping["ONLY_FIRST"] == "First"


def test_legend_is_ordered_stable_and_includes_other():
    """AC6: legend lists buckets in priority order, each with a stable color,
    and 'Other' is present."""
    legend = gf.legend()
    buckets = [e["bucket"] for e in legend]
    assert "Other" in buckets
    assert all("color" in e and e["color"] for e in legend)
    assert legend == gf.legend()  # stable across calls
    # 'Other' is the final entry (it is the catch-all)
    assert buckets[-1] == "Other"
