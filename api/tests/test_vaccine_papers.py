"""SPEC-VOPAPERS-001 — GET /api/v1/vaccine/<vo_id>/papers and its sentence selector.

The route is exercised against a fake DB connection so the tests pin the SQL
contract (which tables, parameterised, no per-paper loop) without a database.
"""
from contextlib import contextmanager

import pytest
from app import create_app
from routes import vaccine
from routes.vaccine import _select_matching_sentences

# ---------------------------------------------------------------------------
# Pure helper
# ---------------------------------------------------------------------------

def test_keeps_only_sentences_containing_a_phrase():
    got = _select_matching_sentences(
        ["rb51"], ["Mice were given RB51.", "Nothing relevant here.", "rb51 is live."])
    assert got == ["Mice were given RB51.", "rb51 is live."]


def test_phrase_boundary_accepts_punctuation_rejects_longer_token():
    # "RB51-induced" contains the whole token rb51; "rb51wboa" is a different token.
    got = _select_matching_sentences(["rb51"], ["RB51-induced immunity.", "The rb51wboa strain."])
    assert got == ["RB51-induced immunity."]


def test_multiword_and_case_insensitive():
    got = _select_matching_sentences(["brucella abortus rb51"], ["BRUCELLA ABORTUS RB51 was used."])
    assert got == ["BRUCELLA ABORTUS RB51 was used."]


def test_dedupes_identical_text_and_keeps_order():
    got = _select_matching_sentences(["vaccine"], ["A vaccine.", " A vaccine. ", "B vaccine."])
    assert got == ["A vaccine.", "B vaccine."]


def test_caps_at_five():
    sents = [f"vaccine sentence {i}" for i in range(9)]
    assert _select_matching_sentences(["vaccine"], sents) == sents[:5]


@pytest.mark.parametrize("phrases,sents", [([], ["a vaccine"]), (["vaccine"], []), ([""], ["x"]), ([None], ["x"])])
def test_empty_inputs_return_empty(phrases, sents):
    assert _select_matching_sentences(phrases, sents) == []


def test_regex_metacharacters_in_phrase_are_literal():
    got = _select_matching_sentences(["bcg (tice)"], ["BCG (Tice) strain.", "bcg tice strain."])
    assert got == ["BCG (Tice) strain."]


# ---------------------------------------------------------------------------
# Route, against a fake DB
# ---------------------------------------------------------------------------

class FakeCursor:
    def __init__(self, handler, log):
        self._handler, self._log, self._rows = handler, log, []

    def execute(self, sql, params=()):
        self._log.append((" ".join(sql.split()), tuple(params)))
        self._rows = self._handler(" ".join(sql.split()), tuple(params))

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def fetchall(self):
        return list(self._rows)

    def close(self):
        pass


class FakeConn:
    def __init__(self, handler, log):
        self._handler, self._log = handler, log

    def cursor(self, dictionary=False):
        return FakeCursor(self._handler, self._log)


def _install(monkeypatch, handler):
    log = []

    @contextmanager
    def fake_db_connection():
        yield FakeConn(handler, log)

    monkeypatch.setattr(vaccine, "db_connection", fake_db_connection)
    return log


@pytest.fixture(scope="module")
def client():
    return create_app().test_client()


def _handler_factory(total=3, page=None, vo_sents=None, legacy=None, recent=None):
    if page is None:
        page = [
            {"pmid": 300, "phrases": "rb51"},
            {"pmid": 200, "phrases": "brucella abortus rb51\x1frb51"},
            {"pmid": 100, "phrases": "rb51"},
        ]

    def handler(sql, params):
        if sql.startswith("SELECT COUNT(DISTINCT pmid)"):
            return [{"total": total}]
        if "GROUP_CONCAT" in sql:
            return page
        if "FROM t_vo_sentences" in sql:
            return vo_sents or []
        if "FROM sentence " in sql:
            return legacy or []
        if "FROM t_sentences" in sql:
            return recent or []
        raise AssertionError(f"unexpected SQL: {sql}")

    return handler


def test_route_shape_order_and_text_sources(client, monkeypatch):
    log = _install(monkeypatch, _handler_factory(
        vo_sents=[{"pmid": 300, "sentence": "RB51 given to calves."},
                  {"pmid": 300, "sentence": "RB51 given to calves."}],
        legacy=[{"pmid": 100, "sentence": "Unrelated sentence."},
                {"pmid": 100, "sentence": "Protection by rb51 was high."}],
    ))
    r = client.get("/api/v1/vaccine/VO_0000021/papers?limit=3")
    assert r.status_code == 200
    body = r.get_json()
    assert body["vo_id"] == "VO_0000021" and body["total_papers"] == 3
    assert [p["pmid"] for p in body["papers"]] == [300, 200, 100]

    p300, p200, p100 = body["papers"]
    assert p300["sentences"] == ["RB51 given to calves."] and p300["text_source"] == "identified"
    assert p200["sentences"] == [] and p200["text_available"] is False and p200["text_source"] is None
    assert p200["matched_phrases"] == ["brucella abortus rb51", "rb51"]
    assert p100["sentences"] == ["Protection by rb51 was high."] and p100["text_source"] == "phrase_match"

    # every query parameterised on vo_id / pmids; no per-paper loop
    assert all("%s" in sql for sql, _ in log)
    assert len(log) <= 5


def test_fallback_only_queried_for_papers_without_identified_text(client, monkeypatch):
    log = _install(monkeypatch, _handler_factory(
        page=[{"pmid": 300, "phrases": "rb51"}], total=1,
        vo_sents=[{"pmid": 300, "sentence": "rb51 here."}]))
    client.get("/api/v1/vaccine/VO_0000021/papers")
    assert not any("FROM sentence " in sql or "FROM t_sentences" in sql for sql, _ in log)


def test_unknown_vo_returns_empty_200(client, monkeypatch):
    _install(monkeypatch, _handler_factory(total=0, page=[]))
    r = client.get("/api/v1/vaccine/VO_9999999/papers")
    assert r.status_code == 200
    assert r.get_json()["total_papers"] == 0 and r.get_json()["papers"] == []


def test_limit_is_bounded_and_offset_passed(client, monkeypatch):
    log = _install(monkeypatch, _handler_factory(total=0, page=[]))
    client.get("/api/v1/vaccine/VO_0000021/papers?limit=999&offset=20")
    page_sql = next(p for s, p in log if "GROUP_CONCAT" in s)
    assert page_sql[-2:] == (50, 20)
    client.get("/api/v1/vaccine/VO_0000021/papers?limit=abc")
    page_sql = [p for s, p in log if "GROUP_CONCAT" in s][-1]
    assert page_sql[-2:] == (10, 0)


def test_db_error_returns_500_json(client, monkeypatch):
    def boom(sql, params):
        raise RuntimeError("db down")
    _install(monkeypatch, boom)
    r = client.get("/api/v1/vaccine/VO_0000021/papers")
    assert r.status_code == 500 and r.get_json()["error"] == "DatabaseError"


def test_fallback_is_time_bounded(client, monkeypatch):
    log = _install(monkeypatch, _handler_factory(
        page=[{"pmid": 100, "phrases": "rb51"}], total=1,
        legacy=[{"pmid": 100, "sentence": "rb51 here."}]))
    client.get("/api/v1/vaccine/VO_0000021/papers")
    fallback = [s for s, _ in log if "FROM sentence " in s or "FROM t_sentences" in s]
    assert fallback
    assert all(s.startswith("SET STATEMENT max_statement_time=") for s in fallback)


def test_fallback_timeout_degrades_to_no_text_not_500(client, monkeypatch):
    base = _handler_factory(page=[{"pmid": 100, "phrases": "rb51"}], total=1)

    def handler(sql, params):
        if "FROM sentence " in sql:
            raise RuntimeError("Query execution was interrupted (max_statement_time exceeded)")
        return base(sql, params)

    _install(monkeypatch, handler)
    r = client.get("/api/v1/vaccine/VO_0000021/papers")
    assert r.status_code == 200
    paper = r.get_json()["papers"][0]
    assert paper["pmid"] == 100
    assert paper["text_available"] is False
