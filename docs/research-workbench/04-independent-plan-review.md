# Independent implementation-readiness review

Verdict: **CHANGES REQUIRED — bounded amendments, not a redesign.**

Reviewer: independent_plan_review, a new technical reviewer independent of all three feature planners. Review scope: plans 00–03 and their current-code prerequisites. No feature implementation, server query, deployment or mining action was performed.

## Claim

The proposed three-feature direction is feasible on the existing SPA/API and appropriately separates uploaded measurements, literature evidence and historical snapshots. The smaller v1 in integration plan 00 is a sound scope. Root should amend three integration details below before approving implementation. There is no need to expand this into account-backed sharing, immutable historical networks or full-text publication.

## Required amendments

### R1 — High: make the restore/rerun boundary explicit in both page adapters

The plan correctly prohibits automatic requests on restore, but the existing Enrichment route automatically invokes analysis for `?genes=` (`frontend/src/pages/Enrichment.jsx:374–385`), and GenePair automatically fetches for `?gene1=&gene2=` (`frontend/src/pages/GenePair.jsx:70–103`). The shared contract currently supplies only `restoreToken`, while describing selected pair context without a pair field in the concrete recipe.

Specify the actual restore path and payload before the feature owners implement independently:

- Loading/importing restores context and input fields without navigating through these auto-submit URLs. A clean path plus a restored-mode/context signal is sufficient; existing public URL behavior can remain unchanged.
- Ratify an optional `pair: null | [geneA, geneB]` in the recipe (or explicitly defer restoring pair inputs). Do not tell users pair context was restored if only selected excerpts were restored.
- Increment a request generation on restore, experiment replacement where it invalidates results, new analysis/pair and unmount. Guard every asynchronous setter, including error/finally paths and prediction-refresh paths.
- Enrichment's non-stream fallback is specifically in scope: `api.enrichment(genes)` resolves into `setData` at `Enrichment.jsx:359–364`. Its `request()` wrapper creates its own AbortController and assigns that signal after spreading options (`api.js:23–31`), so aborting the stream alone is insufficient protection. A generation guard avoids requiring a global API cancellation refactor.
- Add a mocked browser case in which the old fallback resolves after a workspace restore. It must neither display old results nor alter restored input/loading/error state. Also test restore on a clean route produces no query until explicit Run.

These are verified source-level integration requirements, not a claim that a new restore defect already exists; restore has not been implemented yet.

### R2 — Medium: close the pagination prerequisite with attributed schema evidence and exact query ordering

Do not leave `h.id` as an unverified implementation assumption. Checked-in migration `scripts/01_rename_tables.sql:21–30` describes renaming the existing PK to `id`. More directly, the preserved earlier-lane artifact `/home/juhur/.moai/worktrees/projects/Ignet/pubmed-contract-audit/docs/pmc-sentence-id-policy-20261028/live-allocator-schema.json` contains:

```text
t_gene_pairs id bigint(20) NO PRI auto_increment
t_sentences sentence_id int(11) NO PRI
t_sentences PRIMARY 0 1 sentence_id
```

This is retained schema evidence from an earlier observation, read during this review. It is not a fresh measurement of the production schema. The implementation can explicitly target that recorded schema; deployment compatibility remains a later check.

Ratify: page base `t_gene_pairs` rows first with requested ordering plus unique `h.id`, then hydrate only that bounded page's sentence text and annotations. A derived base-page query joined to uniquely keyed sentence text is also acceptable. Never apply LIMIT after the one-to-many INO join. Return stable base rows and preserve existing envelope/scalars while adding the full annotation array. A nonunique composite tie-breaker is not an equivalent guarantee where identical base rows exist.

Use a focused route test containing tied scores, reversed raw pair orientation and multiple annotations. It must prove the page's base-row IDs and all annotations, rather than only assert that a query contains a string. Include null sentence IDs and zero-record pages.

### R3 — Medium: publish one authoritative implementation contract before parallel edits

Root has explicitly selected the smaller limits in plan 00: 2 MiB imports/library, 100 evidence snapshots, 20 saved workspaces, explicit save, Enrichment recipe/overlay plus pair excerpts, no complete Dignet restore. Plans 01 and 03 still contain proposed 5 MB/200-item/autosave alternatives; context action names and recipe structures also differ. These are legitimate independent proposals, but simultaneous implementation must not choose independently.

Amend plan 00 with a short `Authoritative overrides` paragraph and one exact provider/module interface used by all three owners. Minimum decisions to freeze:

- `validateExperiment` and `validateEvidenceSnapshot` accept a plain value and return a reconstructed trusted value or throw; pure modules do not import React/context.
- One experiment payload with nullable metrics; display/range lives in one agreed location, not both experiment and recipe with competing values.
- One provider API for replace experiment, set recipe, select/unselect evidence, restore generation and save/load/import/export errors. Selection recomputes exact identity from validated fields, never an imported key.
- Explicit Save only. Reload discovers saved local workspaces; it must not claim recovery of an unsaved draft. No autosave of experiment/evidence content.
- Save failure leaves the edited in-memory draft available for export and the previous persisted library intact. Invalid import leaves both current draft and persisted library unchanged. These are different failure paths and require separate tests.
- Optional graph-position restore is deferred unless its identity/preset-layout checks are actually implemented. Name saved scope accordingly.

This is a coordination amendment; it does not require a new product interview or additional feature scope.

## Evidence

Commands executed in this review included targeted `rg`, `nl -ba`/`sed` reads of the four plans, `api.js`, Enrichment, GenePair, the migration and the preserved schema JSON. No runtime claims are inferred merely from file existence.

Independent in-memory SQLite cardinality fixture, executed during this review:

```text
{"joined_page": [[1, "a"], [1, "b"]], "base_page": [[1, 101], [2, 102]], "assertions": "PASS"}
```

The fixture uses two base records with tied score 0.8 and three annotations on sentence 101, LIMIT 2. It confirms the structural post-annotation-pagination problem and the base-page alternative. It does not measure live corpus incidence or database performance.

## Positive decisions retained

- Experiments only decorate gene fill and retain raw signed values; degree/evidence semantics stay distinct. Missing is not measured zero. A 500-gene limit reuses the existing analysis boundary.
- Browser-local processing and explicit persistence/export are appropriate. Existing analysis still transmits gene symbols; raw measurements and evidence snapshots must never enter URLs/analytics.
- Loaded-paper grouping, bounded selection and exact text snapshots are useful without asserting complete literature review, calibrated biological probability or experimental replication.
- CSV defensive escaping and lossless JSON have different roles. React text rendering and allowlisted imports are appropriate.
- Saved recipes/excerpts are not frozen historical database results. Unknown provenance remains unknown.
- New storage namespace must preserve legacy gene-set keys. No new dependency or backend workspace service is justified for this v1.

## Baseline attribution

Read-only source baseline: `/home/juhur/.moai/worktrees/projects/Ignet/research-workbench`, initialized at `a2d471c`, plus the four newly authored plan documents. The schema JSON belongs to the preserved prior Ignet audit worktree and is expressly historical evidence. The cardinality test ran against an ephemeral in-memory SQLite fixture in this review, not against MariaDB or production data.

## Gaps

No feature code existed at review time. Browser privacy, stale-response guards, rendering/layout stability, exact import/export semantics, quota handling and endpoint integration remain implementation acceptance gates. No live schema query, performance measurement, all-tests pass, production behavior or actual whole-corpus completeness is asserted. The root-reported baseline 34 frontend tests was not independently rerun by this reviewer.

## Residual risk and review disposition

Once R1–R3 are incorporated and the shared interface is frozen, this reviewer has no further design blocker within the bounded v1. Implementation must still pass its behavior tests and independent code review. A patch addressing these items can receive a bounded re-review without repeating the entire planning exercise.

## Focused amendment re-review

Verdict: **APPROVE for the bounded implementation described in plan 00's authoritative overrides.** Root's separate implementation approval is still required; this is not deployment approval.

Readback of `00-integration-plan.md`, section `Authoritative overrides after independent review R1–R3`, confirms:

- R1 addressed: an explicit nullable recipe pair, clean-path restore, suppression of existing auto-submit links only for restored context, and generation checks across fallback/prediction/trend/error/loading paths. The delayed-fallback browser test is mandatory.
- R2 addressed: h-only bounded pagination plus hydration, deterministic `h.id` order with honestly attributed historical schema evidence, and behavior tests for fanout/ties/reversed orientation/null/empty pages. Live compatibility is reserved for later deployment.
- R3 addressed: one exact provider and serialized schema, one display location, validators returning reconstructed objects, 2 MiB/20 saves/100 excerpts, explicit Save/no autosave, clear distinction between save versus invalid-import failures, and deferred layout/full Dignet recipe restore.

No remaining design blocker was found within this focused delta review. The earlier `CHANGES REQUIRED` disposition is superseded for R1–R3 by this approval. All implementation/runtime gaps and residual risks above remain; these contracts must be demonstrated by the scoped tests and independent implementation review rather than assumed satisfied by this document.
