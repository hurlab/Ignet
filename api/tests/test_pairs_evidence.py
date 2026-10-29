"""Exercise the real pair route against a bounded SQL fixture, without MySQL."""
import sqlite3
from contextlib import contextmanager

import pytest
from flask import Flask
from routes import pairs


@pytest.fixture
def client(monkeypatch):
    db = sqlite3.connect(":memory:")
    db.row_factory = sqlite3.Row
    db.executescript("""
        CREATE TABLE t_gene_pairs (id INTEGER PRIMARY KEY, sentence_id INTEGER,
          pmid INTEGER, gene_symbol1 TEXT, gene_symbol2 TEXT, score REAL);
        CREATE TABLE t_sentences (sentence_id INTEGER PRIMARY KEY, sentence TEXT);
        CREATE TABLE t_ino (sentence_id INTEGER, ino_id TEXT, matching_phrase TEXT);
        INSERT INTO t_gene_pairs VALUES
          (1,101,11,'A','B',0.9),(2,102,12,'B','A',0.9),(3,NULL,13,'A','B',NULL);
        INSERT INTO t_sentences VALUES (101,'first'),(102,'second');
        INSERT INTO t_ino VALUES
          (101,'INO:2','regulates'),(101,'INO:1','binds'),(101,'INO:1','binds');
    """)

    class Cursor:
        def execute(self, sql, params=None):
            self.result = db.execute(sql.replace("%s", "?"), params or [])

        def fetchone(self):
            row = self.result.fetchone()
            return dict(row) if row else None

        def fetchall(self):
            return [dict(row) for row in self.result.fetchall()]

        def close(self):
            pass

    class Connection:
        def cursor(self, **kwargs):
            return Cursor()

    @contextmanager
    def connection():
        yield Connection()

    monkeypatch.setattr(pairs, "db_connection", connection)
    app = Flask(__name__)
    app.register_blueprint(pairs.pairs_bp)
    yield app.test_client()
    db.close()


def test_pages_base_rows_before_hydrating_annotations(client):
    data = client.get('/pairs/A/B?per_page=2').get_json()
    assert data['total'] == 3
    assert [row['id'] for row in data['interactions']] == [1, 2]
    first = data['interactions'][0]
    assert first['sentence_text'] == 'first'
    assert first['ino_annotations'] == [
        {'ino_id': 'INO:1', 'matching_phrase': 'binds'},
        {'ino_id': 'INO:2', 'matching_phrase': 'regulates'},
    ]
    assert (first['ino_id'], first['matching_phrase']) == ('INO:1', 'binds')


def test_ties_and_reversed_pair_keep_same_pages(client):
    forward = client.get('/pairs/A/B?per_page=1&page=2').get_json()
    reverse = client.get('/pairs/B/A?per_page=1&page=2').get_json()
    assert forward['interactions'] == reverse['interactions']
    assert [row['id'] for row in forward['interactions']] == [2]


def test_null_sentence_and_empty_page(client):
    data = client.get('/pairs/A/B?per_page=2&page=2').get_json()
    assert len(data['interactions']) == 1
    row = data['interactions'][0]
    assert row['sentence_id'] is None and row['sentence_text'] is None
    assert row['ino_annotations'] == [] and row['matching_phrase'] is None
    empty = client.get('/pairs/A/B?page=9').get_json()
    assert empty['total'] == 3 and empty['interactions'] == []
