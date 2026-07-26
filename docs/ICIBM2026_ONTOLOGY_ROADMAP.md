# Ontology-Depth Roadmap (ICIBM 2026)

Working plan for deepening ontology use in Ignet 2.0 / Vignet, written for the
ICIBM 2026 Ontology Applications talk: *"From Biomedical Ontologies to Knowledge
Discovery: Ontology-Driven Applications in Ignet 2.0 and Vignet."*

Status: **E and A in progress; B and C specified, not started.**
Rollback point for all of this work: tag `pre-icibm-baseline`.

---

## Motivating audit (2026-07-25)

The question an ontology-applications audience asks is not *which* ontologies you
integrate, but whether you use ontology **structure** (hierarchy, subsumption) or
only ontology **terms** (a flat vocabulary). Audited against the code:

| Ontology | What the code actually did | Depth |
|---|---|---|
| **VO** | `t_vo_hierarchy` (`parent_vo_id`, `level`) + `/vaccine/hierarchy` nested tree + VO tree UI | Genuine structural use |
| **INO** | `t_ino.matching_phrase` free text grouped by raw string; classification by hardcoded English keyword lists in `api/utils/ino_classifier.py` | Vocabulary only |
| **HDO / DOID** | `hdo_term` comma-joined free text in `t_biosummary`; `hdo_id` present only in the VO co-occurrence tables | Mostly vocabulary |
| **OGG** | SARS-CoV-2 subset only | Partial (already disclosed) |

Before this work the schema contained exactly **one** hierarchy table
(`t_vo_hierarchy`). The live INO Explorer's top "interaction types" were
generic English words — *associated, effects, induced, expression, activity,
effect, increased, including* — because the endpoint grouped on the matched
phrase rather than the ontology class.

**Undisclosed finding:** interaction annotation is already **multi-ontology**.
The 166 distinct `t_ino.ino_id` values span three namespaces — 86 `INO_*`,
57 `MI_*` (PSI Molecular Interactions), 23 `GO_*` (Gene Ontology) — plus 15
`INO_T*` template artifacts that are not ontology classes at all. The deck
credits INO only. MI and GO deserve to be named.

---

## E — Demo hardening (done)

**E1. Stats collapse guard.** The nightly loader deletes-then-reloads rows, so a
`COUNT(*)` issued mid-load can observe a partially populated `t_gene_pairs`.
That snapshot was cached under a 24 h TTL: on 2026-07-25 the landing page served
**573,167** gene pairs against an actual **6,151,660** for ~7 hours, silently
undercutting the platform-benchmarking slide. Counts are now vetted against a
companion `:last_good` key (no TTL); an implausible collapse is neither cached
nor served. 6 regression tests.

**E2. `/ino/terms` caching.** The listing grouped over all 54.7M `t_ino` rows at
~16 s cold — long enough to stall a live demo. Now cached 24 h. Superseded in
substance by A's materialised summary.

---

## A — Make INO actually ontological (in progress)

**Key enabler:** `t_ino.ino_id` is already populated on all 54,756,870 rows. No
re-annotation is needed; the ontology identifiers were simply never used.

**The payoff.** Grouping by `ino_id` instead of `matching_phrase` collapses
synonyms into their real class. `INO_0000157` alone absorbs 69 distinct phrases
("effects", "effect", "changes", ...) totalling 11.75M rows:

| By phrase (before) | By ontology class (after) | Rows |
|---|---|---|
| associated, effects, effect, changes… | **regulation** (`INO_0000157`) | 11,753,404 |
| increased… | **increase** (`INO_0000120`) | 4,066,609 |
| — | **association** (`MI_0914`) | 3,439,942 |
| induced… | **induction** (`INO_0000122`) | 3,122,283 |

**Delivered so far**
- `scripts/build_ino_hierarchy.py` — reproducible generator. Parses
  `ino_merged.owl` for labels + `rdfs:subClassOf` edges, resolves the GO labels
  INO references but does not import via QuickGO, and emits additive SQL.
- `t_ino_hierarchy` — 362 rows; **all 166 in-use ids resolve (166/166)**.
- `t_ino_class_summary` — per-class counts materialised offline so the endpoint
  never rescans 54.7M rows.

**Design note — the noise filter is principled, not a stopword list.** The junk
("including", "through") is exactly the `INO_T*` namespace: template artifacts
that are not classes in the ontology. They are flagged `is_template=1` and
excluded by namespace. An earlier draft filtered on "absent from the merged
OWL", which was wrong — that also drops 19 legitimate `GO_*` classes (e.g.
`GO_0006468` protein phosphorylation) that INO references without importing.

**Remaining**
- Rewrite `/ino/terms` to serve ontology classes (label, id, ontology, parent).
- Replace `api/utils/ino_classifier.py` keyword sets with hierarchy lookup, so
  subsumption comes from the ontology rather than substring matching.
- INO Explorer UI: show class label + id + parent; optional roll-up to parent.
- Nightly refresh hook for `t_ino_class_summary`.

**Data-quality note for the talk:** 6 of the 23 referenced GO classes are
**obsolete** (e.g. `GO_0016572` obsolete histone phosphorylation). Worth
disclosing — and a natural argument for ontology-versioned annotation.

---

## B — DOID hierarchy for disease-centered exploration (specified, not started)

The abstract promises "disease-centered exploration". Today disease handling is
free text.

**Verified current state**
- `t_hdo` exists with **19,581,731 rows** and the API **never queries it** —
  zero references in `api/`.
- Disease terms instead come from `t_biosummary.hdo_term`, a comma-joined
  varchar split at query time by `_split_terms()`.
- `api/routes/dignet.py` `_aggregate_entity_network` drops "generic disease
  classifiers" via an ad-hoc rule — the symptom of having no hierarchy.
- Real `hdo_id` values exist, but only in `t_cooccurrence_vo_hdo`.

**Plan**
1. Verify `t_hdo`'s schema and confirm it carries a DOID identifier column.
   *(Not yet verified — do this first; it decides the whole approach.)*
2. Download the Human Disease Ontology (`doid.obo` / `doid.owl`).
3. Build `t_doid_hierarchy` reusing the `build_ino_hierarchy.py` pattern
   (id, label, parent, level, obsolete flag).
4. Switch disease aggregation from `hdo_term` free text to `t_hdo` ids joined
   to the hierarchy.
5. Enable roll-up: "lung cancer" + "breast cancer" aggregate under "cancer" at
   a chosen level; retire the generic-classifier hack in favour of principled
   level-based filtering.

**Sequencing:** touches the same `dignet.py` aggregation functions as A →
**run after A**, on branch `feat/doid-hierarchy`.

**Risk:** medium. `t_hdo` at 19.5M rows needs the same materialised-summary
treatment as A, and the entity endpoints are on the Dignet critical path.

---

## C — VO class-level reasoning in Vignet (specified, not started)

The cheapest *real* ontology-reasoning demo, because the hierarchy already exists.

**Verified current state**
- `t_vo_hierarchy` and `GET /api/v1/vaccine/hierarchy` work and return a nested
  tree with `vo_id`, `name`, `level`, `has_data`, `children`.
- But the tree is **browse/selection only**: selecting a VO class does not roll
  descendant evidence up. Many nodes report `has_data: false` even when their
  subtree carries evidence, so broad classes look empty.

**Plan**
1. Expand a selected `vo_id` to its `is_a` descendant closure and aggregate
   evidence across the subtree.
2. Redefine `has_data` as "has data anywhere in subtree", making parent classes
   meaningfully selectable.
3. Demo: select a broad class (e.g. a viral-vaccine parent) and show evidence
   aggregated over all descendant vaccines — subsumption doing real work.

**Sequencing:** isolated from A and B (`api/routes/vaccine.py` + Vignet
frontend) → safely parallel, branch `feat/vo-class-rollup`.

**Risk:** low technically, but **spans two repos** — Vignet is separate with a
different deploy path (git for source, `rsync` for `dist-react`, no npm on the
server). Budget for the second deploy.

---

## Operating rules for this work

1. **Rollback point:** tag `pre-icibm-baseline`.
2. **Additive-only DB changes.** Only `CREATE` new tables. Never `ALTER`/`DROP`
   an existing one. Same discipline as the CoV backfill.
3. **`main` auto-deploys** (`scripts/deploy.sh` → server `git reset --hard`).
   Anything merged to main is live. Unfinished work stays on a branch.
4. **Do not commit `dist-react` on feature branches** — hashed asset filenames
   conflict on merge. Rebuild once on main after merging.
5. **Freeze ~2 days before the talk.** Present a site you have lived with.
