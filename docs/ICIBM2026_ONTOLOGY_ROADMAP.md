# Ontology-Depth Roadmap (ICIBM 2026)

Working plan for deepening ontology use in Ignet 2.0 / Vignet, written for the
ICIBM 2026 Ontology Applications talk: *"From Biomedical Ontologies to Knowledge
Discovery: Ontology-Driven Applications in Ignet 2.0 and Vignet."*

Status: **E and A complete and live-verified. B specified (verified feasible).
C found to be largely already implemented — see the correction in its section.**
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

## A — Make INO actually ontological (complete, live-verified)

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

**Also delivered**
- `/ino/terms` serves ontology classes (label, id, source ontology, parent).
- `/ino/terms/<term>/genes?ino_id=` selects a whole class rather than one
  phrase; ids validated against a namespace pattern.
- INO Explorer passes the class id and shows provenance (id, ontology, parent).
- `idx_ino_id_sentence (ino_id, sentence_id)` on `t_ino`. `t_ino` had no index
  leading with `ino_id`, and its composite index leads with `pmid`, so the
  legacy phrase lookup could not use it either — the drill-down was already
  slow before class selection existed. Built online in 1 min 44 s with no
  service degradation. Reversible: `DROP INDEX idx_ino_id_sentence ON t_ino`.
- 24 h caching on the drill-down + `scripts/warm_ino_cache.sh` to pre-warm.

**Measured (production)**

| Endpoint | Before | After |
|---|---|---|
| `/ino/terms` cold | 16.6 s | 0.21 s |
| `/ino/terms` warm | — | 0.03 s |
| class drill-down | >300 s (timeout) | 19–26 s cold, 0.07 s warm |

Biology check: `ubiquitination reaction` (MI_0220) → TP53~MDM2 (p53's canonical
E3 ligase); `phosphorylation` (GO_0016310) → AKT1~PIK3CA. Browser-verified: the
listing reads as an interaction taxonomy, "including"/"through" are gone, and
the detail panel shows `INO_0000157 · INO · subclass of association`.

**Remaining (deliberately deferred)**
- Replace `api/utils/ino_classifier.py` keyword sets with hierarchy lookup. The
  hierarchy already yields `positive regulation` / `negative regulation` as real
  parent classes, which is exactly what the keyword lists approximate. Deferred
  because `classify_ino` feeds Dignet's network edge colouring — the primary
  demo surface — so the swap should be deliberate, not a drive-by.
- Nightly refresh hook for `t_ino_class_summary` (currently built once).
- Cosmetic: the drill-down lists each unordered pair twice (AKT1~PIK3CA and
  PIK3CA~AKT1) because both orders are stored. Visible in a demo. Canonicalising
  the order would also halve the reported `total`, so it is a semantic change,
  not just display.

**Data-quality note for the talk:** 6 of the 23 referenced GO classes are
**obsolete** (e.g. `GO_0016572` obsolete histone phosphorylation). Worth
disclosing — and a natural argument for ontology-versioned annotation.

---

## B — DOID hierarchy for disease-centered exploration (specified, not started)

The abstract promises "disease-centered exploration". Today disease handling is
free text. **Verified 2026-07-26.**

**`t_hdo` carries real DOID identifiers.** Schema: `id`, `pmid`, `hdo_id`
varchar(255), `hdo_term` varchar(255). 19,581,731 rows, **7,213 distinct
`hdo_id`**, **12,564,118 distinct PMIDs**. The API queries it **nowhere** —
zero references in `api/`.

Disease terms instead come from `t_biosummary.hdo_term`, a comma-joined varchar
split at query time by `_split_terms()`. So the platform reads disease
annotation as text while a fully identified, paper-level DOID table sits unused.

**The hack this replaces.** `api/routes/dignet.py:62`:

    _HDO_GENERIC_TERMS = frozenset({"disease", "syndrome", "disorder"})

Those are not arbitrary stopwords — they are ontology classes:

| hdo_id | term | rows | note |
|---|---|---|---|
| `DOID:4` | disease | 2,409,098 | **the root of the Disease Ontology** |
| `DOID:162` | cancer | 1,323,162 | broad, and NOT in the stopword list |
| `DOID:225` | syndrome | 661,293 | |
| `DOID:1612` | breast cancer | 335,027 | specific — genuinely useful |
| `DOID:0080600` | covid-19 | 333,145 | specific |

The list filters the ontology *root* by name. A depth rule ("exclude classes
above depth N") is both principled and strictly more complete: it also catches
`DOID:162` cancer, which the hand-written list misses. This is the same
before/after argument as INO, on a second ontology.

**Plan**
1. Download the Human Disease Ontology (`doid.obo` / `doid.owl`).
2. Build `t_doid_hierarchy` reusing `scripts/build_ino_hierarchy.py` (id, label,
   parent, level, obsolete flag). The generator is already ontology-agnostic
   apart from its OWL source and namespace handling.
3. Materialise `t_doid_class_summary` (per-DOID counts) — 19.5M rows is the same
   scale as `t_ino`, so the same offline-aggregation approach applies.
4. **Add `idx_hdo_id` on `t_hdo`.** It currently indexes only `id` and `pmid` —
   exactly the gap that made the INO drill-down a full scan. Assume this is
   required, not optional.
5. Switch disease aggregation from `hdo_term` free text to `hdo_id` joined to
   the hierarchy; replace `_HDO_GENERIC_TERMS` with a depth rule; enable roll-up
   ("lung cancer" + "breast cancer" under "cancer").

**Possible coverage win (unverified).** `t_hdo` spans 12.5M PMIDs versus
`t_biosummary`'s 2.65M. How much of that is reachable for gene-disease work
depends on the overlap with gene-annotated papers — **measure before claiming
it.** If it holds, B is not only a semantics upgrade but a coverage one.

**Sequencing:** touches the same `dignet.py` aggregation as A → branch
`feat/doid-hierarchy`. **Risk: medium** — 19.5M rows, an index build, and the
Dignet entity endpoints are on the critical demo path.

## C — VO class-level reasoning (LARGELY ALREADY IMPLEMENTED)

**This section was wrong in the first draft. Corrected 2026-07-26 after reading
the code.** The earlier claim — that the VO tree is "browse/selection only" with
"no subtree rollup" and that parent classes "look empty" — is false on both
counts.

**What actually exists**
- `api/routes/vaccine.py:363` already performs descendant expansion via
  `WITH RECURSIVE descendants` under an `implicit` flag: selecting a class
  pulls in its `is_a` descendants.
- `vaccine.py:271` already prunes with `data_only`: "no data and no descendants
  with data".
- `t_vo_has_gene_data` is **already subtree-closed**. Computed over all 6,796
  nodes: of the 665 data-bearing nodes present in the hierarchy, the number of
  ancestors NOT already flagged is **0**. Parent classes such as *viral vaccine*
  (239 data-bearing descendants) and *cancer vaccine* (66) already report
  `has_data: true`.
- Vignet's `VacNet.jsx:20` sets `useState(true)` — **implicit expansion is ON by
  default in the UI**, with a checkbox at line 775.

So subsumption over the Vaccine Ontology is a shipped, default-on capability.
For the talk this is better news than the original plan: it is an existing
strength to demonstrate, not work to schedule.

**What is genuinely left (small, mostly framing)**
1. **API/UI default mismatch.** `implicit` defaults to **false** server-side
   (`vaccine.py:618`, absent param → false) while Vignet's UI defaults to
   **true**. API consumers and MCP clients therefore get different semantics
   than the web UI — an interoperability wrinkle worth resolving or documenting.
2. **It is not surfaced as ontology reasoning.** The control reads "Include
   child vaccine associations (implicit)" — implementation jargon. Naming it as
   class-level/subsumption reasoning, and showing what it did ("rolled up from N
   descendant classes"), converts an invisible feature into the talk's clearest
   demonstration of an ontology doing real work.
3. Optional: a before/after toggle in the demo (implicit off → on) to make
   subsumption visible live.

**Sequencing:** isolated (`vaccine.py` + Vignet frontend). **Risk: low** — but
note Vignet is a separate repo with a different deploy path (git for source,
`rsync` for `dist-react`, no npm on the server).

## Operating rules for this work

1. **Rollback point:** tag `pre-icibm-baseline`.
2. **Additive-only DB changes.** Only `CREATE` new tables. Never `ALTER`/`DROP`
   an existing one. Same discipline as the CoV backfill.
3. **`main` auto-deploys** (`scripts/deploy.sh` → server `git reset --hard`).
   Anything merged to main is live. Unfinished work stays on a branch.
4. **Do not commit `dist-react` on feature branches** — hashed asset filenames
   conflict on merge. Rebuild once on main after merging.
5. **Freeze ~2 days before the talk.** Present a site you have lived with.
