"""SPEC-COHORT-001 — endpoint tests for POST /api/v1/genes/functional-classes.

Uses the Flask test client. Redis is unavailable in the test environment
(get_redis() returns None), so these also cover the no-cache fallback (AC8).
"""
import pytest

from app import create_app


@pytest.fixture(scope="module")
def client():
    return create_app().test_client()


def test_endpoint_returns_classes_and_legend(client):
    """AC5/AC9: 200 with classes (every gene keyed) + ordered legend."""
    r = client.post("/api/v1/genes/functional-classes",
                    json={"genes": ["IL6", "TNF", "BRCA1", "CDK1"]})
    assert r.status_code == 200
    body = r.get_json()
    assert set(body["classes"].keys()) == {"IL6", "TNF", "BRCA1", "CDK1"}
    assert isinstance(body["legend"], list) and body["legend"]
    assert all("bucket" in e and "color" in e for e in body["legend"])


def test_endpoint_no_cache_fallback(client):
    """AC8: with Redis unavailable the endpoint still returns 200."""
    r = client.post("/api/v1/genes/functional-classes", json={"genes": ["IL6", "TNF"]})
    assert r.status_code == 200


def test_single_gene_is_allowed(client):
    """N1 boundary: the classification endpoint accepts a single gene (min 1)."""
    r = client.post("/api/v1/genes/functional-classes", json={"genes": ["IL6"]})
    assert r.status_code == 200
    assert "IL6" in r.get_json()["classes"]


@pytest.mark.parametrize("body", [
    {},                                  # missing genes
    {"genes": "IL6"},                    # not a list
    {"genes": []},                        # empty
    {"genes": ["!!!", "@@@"]},           # zero valid after sanitize
])
def test_validation_returns_400(client, body):
    assert client.post("/api/v1/genes/functional-classes", json=body).status_code == 400


def test_over_500_genes_returns_400(client):
    r = client.post("/api/v1/genes/functional-classes",
                    json={"genes": [f"GENE{i}" for i in range(501)]})
    assert r.status_code == 400


def test_per_endpoint_rate_limit_registered(client):
    """AC7: the 30/min per-endpoint limit is applied at the route."""
    app = client.application
    mgr = app.limiter.limit_manager
    lims = mgr.resolve_limits(app, "genes.functional_classes", "genes", None, False, False)
    flat = []
    for l in lims:
        try:
            flat.extend(str(x.limit) for x in l)
        except TypeError:
            flat.append(str(getattr(l, "limit", l)))
    assert any("30 per 1 minute" in s for s in flat)
