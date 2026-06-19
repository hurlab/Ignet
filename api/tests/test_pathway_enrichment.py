"""Tests for pathway_enrichment: hypergeometric test, BH FDR, GMT loading, and
the analyze_pathways aggregation. Pure (no Flask/DB) — uses the bundled GMTs.
"""
import math

import pathway_enrichment as pe


# --- hypergeometric survival function -----------------------------------------

def test_hypergeom_hand_checked():
    # M=10, n=5, N=4, k=4 -> C(5,4)C(5,0)/C(10,4) = 5/210
    assert math.isclose(pe.hypergeom_sf(4, 10, 5, 4), 5 / 210, rel_tol=1e-9)


def test_hypergeom_k_zero_is_one():
    assert pe.hypergeom_sf(0, 10, 5, 4) == 1.0


def test_hypergeom_k_above_max_is_zero():
    assert pe.hypergeom_sf(5, 10, 5, 4) == 0.0  # can't draw 5 successes in 4 draws


def test_hypergeom_at_least_one():
    # P(X>=1) = 1 - C(5,0)C(5,5)/C(10,5) = 1 - 1/252
    assert math.isclose(pe.hypergeom_sf(1, 10, 5, 5), 1 - 1 / 252, rel_tol=1e-9)


# --- Benjamini-Hochberg -------------------------------------------------------

def test_benjamini_hochberg_known_values():
    # ascending pvalues, m=3 hypotheses
    adj = pe._benjamini_hochberg([0.01, 0.02, 0.04], 3)
    assert math.isclose(adj[0], 0.03, rel_tol=1e-9)
    assert math.isclose(adj[1], 0.03, rel_tol=1e-9)  # monotone: pulled up from 0.03
    assert math.isclose(adj[2], 0.04, rel_tol=1e-9)


def test_benjamini_hochberg_is_monotone_nondecreasing():
    adj = pe._benjamini_hochberg([0.001, 0.5, 0.5, 0.9], 4)
    assert all(adj[i] <= adj[i + 1] + 1e-12 for i in range(len(adj) - 1))


# --- GMT loading --------------------------------------------------------------

def test_library_loads_and_caches():
    lib1 = pe.load_library("KEGG")
    lib2 = pe.load_library("KEGG")
    assert lib1 is lib2  # cached identity
    assert lib1["terms"] and lib1["universe"]
    assert "Cell cycle" in lib1["terms"]


def test_unknown_library_raises():
    try:
        pe.load_library("NOPE")
        assert False, "expected KeyError"
    except KeyError:
        pass


# --- analyze_pathways ---------------------------------------------------------

DNA_REPAIR_SET = ["BRCA1", "BRCA2", "TP53", "ATM", "ATR", "CHEK1", "CHEK2", "RAD51", "MDM2", "CDKN1A"]


def test_analyze_returns_all_libraries_by_default():
    res = pe.analyze_pathways(DNA_REPAIR_SET, top_n=5)
    assert set(res.keys()) == set(pe.LIBRARIES.keys())


def test_analyze_top_term_is_relevant_and_significant():
    res = pe.analyze_pathways(DNA_REPAIR_SET, top_n=3)
    kegg_top = res["KEGG"][0]
    assert kegg_top["adj_pvalue"] < 0.01
    assert kegg_top["overlap"] >= 1 and kegg_top["overlap"] <= kegg_top["term_size"]
    # the DNA-damage gene set should surface a cancer/p53/cell-cycle KEGG term
    assert any(kw in kegg_top["term"].lower() for kw in ["p53", "cancer", "cell cycle"])


def test_analyze_respects_library_subset_and_top_n():
    res = pe.analyze_pathways(DNA_REPAIR_SET, libraries=["KEGG"], top_n=2)
    assert list(res.keys()) == ["KEGG"]
    assert len(res["KEGG"]) <= 2


def test_analyze_no_overlap_yields_empty():
    # genes guaranteed absent from any library universe
    res = pe.analyze_pathways(["ZZZFAKE1", "ZZZFAKE2"], libraries=["KEGG"])
    assert res["KEGG"] == []


def test_analyze_results_sorted_by_pvalue():
    rows = pe.analyze_pathways(DNA_REPAIR_SET, libraries=["GO_Biological_Process"], top_n=10)["GO_Biological_Process"]
    pvals = [r["pvalue"] for r in rows]
    assert pvals == sorted(pvals)
