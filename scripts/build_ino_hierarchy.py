#!/usr/bin/env python3
"""Build t_ino_hierarchy from the INO ontology (+ GO labels via QuickGO).

Why this exists
---------------
t_ino stores a real ontology id per annotation (ino_id), but every consumer
grouped on the raw matched phrase instead. That splits a single ontology class
across many rows -- INO_0000157 ("regulation") alone surfaces as "effects",
"effect", "changes", ... -- so the INO Explorer ranked generic English words
rather than interaction types. This script materialises the class metadata
needed to group by ontology class and to roll a class up to its parents.

Sources
-------
- INO merged OWL: labels + rdfs:subClassOf edges. Covers INO_* and MI_* ids.
- QuickGO REST:   labels for the GO_* ids that INO references but does not
                  import into its merged OWL.

Namespaces present in t_ino.ino_id (166 distinct ids as of 2026-07):
    INO_*    Interaction Network Ontology classes
    MI_*     PSI Molecular Interactions classes (imported by INO)
    GO_*     Gene Ontology classes (referenced, NOT imported by INO)
    INO_T*   template artifacts -- NOT ontology classes. These carry the
             stopword-like matches ("including", "through") and are flagged
             is_template=1 so consumers can exclude them by namespace rather
             than by a hand-maintained stopword list.

Output: SQL on stdout (CREATE TABLE IF NOT EXISTS + REPLACE INTO). Additive --
it never alters or drops an existing table.

Usage:
    python3 scripts/build_ino_hierarchy.py --owl ino_merged.owl > ino_hierarchy.sql
    # then, on the DB host:
    mysql --defaults-file=~/.my.cnf ignet < ino_hierarchy.sql
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
import xml.etree.ElementTree as ET

NS = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "owl": "http://www.w3.org/2002/07/owl#",
}
OWL_URL = "https://raw.githubusercontent.com/INO-ontology/ino/master/src/ino_merged.owl"
QUICKGO = "https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/{ids}"

TABLE = "t_ino_hierarchy"


def _curie(uri: str | None) -> str | None:
    """http://purl.obolibrary.org/obo/INO_0000157 -> INO_0000157."""
    return uri.rsplit("/", 1)[-1] if uri else None


def parse_owl(path: str) -> dict[str, dict]:
    """Return {id: {"label": str|None, "parents": [id, ...]}} from an OWL file."""
    root = ET.parse(path).getroot()
    out: dict[str, dict] = {}
    for cls in root.findall("owl:Class", NS):
        cid = _curie(cls.get(f"{{{NS['rdf']}}}about"))
        if not cid:
            continue
        label = cls.find("rdfs:label", NS)
        parents = [
            _curie(s.get(f"{{{NS['rdf']}}}resource"))
            for s in cls.findall("rdfs:subClassOf", NS)
            if s.get(f"{{{NS['rdf']}}}resource")
        ]
        out[cid] = {
            "label": label.text if label is not None else None,
            "parents": [p for p in parents if p],
        }
    return out


def fetch_go_labels(go_ids: list[str]) -> dict[str, str]:
    """Resolve GO_* labels via QuickGO. Returns {} on any failure (labels are
    a nicety; the table is still usable with ids alone)."""
    if not go_ids:
        return {}
    joined = ",".join(i.replace("_", ":") for i in sorted(go_ids))
    try:
        req = urllib.request.Request(
            QUICKGO.format(ids=joined), headers={"Accept": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=90) as resp:  # noqa: S310 (fixed https host)
            payload = json.load(resp)
    except Exception as exc:  # pragma: no cover - network dependent
        print(f"-- WARNING: QuickGO lookup failed ({exc}); GO labels omitted", file=sys.stderr)
        return {}
    return {r["id"].replace(":", "_"): r["name"] for r in payload.get("results", []) if r.get("name")}


def compute_level(cid: str, classes: dict[str, dict], _seen: set[str] | None = None) -> int:
    """Depth from a root. Cycles and dangling parents terminate at the current depth."""
    _seen = _seen or set()
    if cid in _seen:
        return 0
    parents = classes.get(cid, {}).get("parents") or []
    if not parents:
        return 0
    return 1 + max(compute_level(p, classes, _seen | {cid}) for p in parents)


def namespace_of(cid: str) -> str:
    if cid.startswith("INO_T"):
        return "INO_T"
    return cid.split("_", 1)[0]


def sql_escape(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--owl", required=True, help="path to ino_merged.owl")
    ap.add_argument("--used-ids", help="optional TSV whose first column lists ids in use")
    ap.add_argument("--no-network", action="store_true", help="skip the QuickGO lookup")
    args = ap.parse_args()

    classes = parse_owl(args.owl)

    used: list[str] = []
    if args.used_ids:
        with open(args.used_ids, encoding="utf-8") as fh:
            used = [line.split("\t")[0].strip() for line in fh if line.strip()]

    # Emit every OWL class so ancestor chains stay walkable even through classes
    # that are never directly annotated, plus any used id the OWL omits.
    all_ids = set(classes) | set(used)

    go_missing = sorted(i for i in all_ids if i.startswith("GO_") and not classes.get(i, {}).get("label"))
    go_labels = {} if args.no_network else fetch_go_labels(go_missing)

    print(f"-- {TABLE}: generated by scripts/build_ino_hierarchy.py")
    print(f"-- classes from OWL: {len(classes)} | ids in use: {len(used)} | rows: {len(all_ids)}")
    print(f"-- GO labels resolved via QuickGO: {len(go_labels)}/{len(go_missing)}")
    print(f"""
CREATE TABLE IF NOT EXISTS {TABLE} (
  ino_id        VARCHAR(45)  NOT NULL,
  label         VARCHAR(255) DEFAULT NULL,
  parent_ino_id VARCHAR(45)  DEFAULT NULL,
  level         INT          NOT NULL DEFAULT 0,
  -- INO's merged OWL imports broadly (NCBITaxon, CHEBI, OGG, PR, PW, BFO,
  -- LifO, ...), so this must hold more than the INO/MI/GO prefixes in t_ino.
  ontology      VARCHAR(32)  NOT NULL,
  is_template   TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (ino_id),
  KEY idx_parent (parent_ino_id),
  KEY idx_ontology (ontology)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
""")

    rows = []
    for cid in sorted(all_ids):
        info = classes.get(cid, {})
        label = info.get("label") or go_labels.get(cid)
        parents = info.get("parents") or []
        parent = parents[0] if parents else None  # primary is_a for tree display
        ns = namespace_of(cid)
        rows.append(
            "({}, {}, {}, {}, {}, {})".format(
                sql_escape(cid),
                sql_escape(label),
                sql_escape(parent),
                compute_level(cid, classes),
                sql_escape(ns),
                1 if ns == "INO_T" else 0,
            )
        )

    print(f"REPLACE INTO {TABLE} (ino_id, label, parent_ino_id, level, ontology, is_template) VALUES")
    print(",\n".join(rows) + ";")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
