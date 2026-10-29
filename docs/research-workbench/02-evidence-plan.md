# Independent plan 2: evidence workbench

Status: independent proposal, awaiting review and root approval. No feature implementation performed.

## Goal and bounded v1 assumptions

Extend the existing GenePair page into a paper-grouped review of retrieved evidence, with explicit selection and selected-evidence CSV/JSON export. Retain its graph, trends, explicit prediction action and existing response envelope. EvidencePopup remains a compact preview linking to the workbench. This feature does not depend on unpublished PMC body results, allocate persistent sentence IDs or modify production publication.

Proposed limits, to harmonize with the shared workspace plan: 50 base records per request, at most 500 loaded base records per pair, and at most 100 selected evidence snapshots. These are product bounds, not measured performance guarantees. Root may adjust them consistently across import, workspace and evidence components.

## Current code evidence

Inspected baseline: `/home/juhur/PROJECTS/10_apps/Ignet`; root reports the isolated implementation tree starts from the same `a2d471c` snapshot. All file observations below were read in this planning run.

- `frontend/src/api.js:62`: `genePair(s1,s2)` fixes `include_summary=true` and exposes no paging options.
- `frontend/src/pages/GenePair.jsx:77`, `:106`, `:148`: URL-based load, submitted load and explicit prediction/refresh. Preserve these capabilities.
- `GenePair.jsx:349`: evidence table sorts the returned array. `:437` increases a local slice rather than requesting another API page.
- `frontend/src/components/EvidencePopup.jsx:102`: same pair API. `:114` displays ten returned records. `:247` links to GenePair. Preserve focus, Escape/backdrop close and scroll restoration.
- `api/routes/pairs.py:87`: API page/per_page support, default 50 and maximum 200.
- `pairs.py:172`: count is over base pair records. `:184`: data LIMIT follows a sentence-level INO join.
- `pairs.py:207`: optional summary aggregates the whole pair independently of evidence filters.
- `pairs.py:157`: keyword filtering is disabled. Do not advertise an unsupported server-side search.
- `GenePair.jsx:22`: current CSV helper quotes sentence text only; use a tested cell encoder for the new export rather than extending this join.
- `frontend/src/pages/Report.jsx:66`: independent rendered HTML report export; leave this flow intact in v1.
- `frontend/package.json` and `frontend/vite.config.js`: Vitest and Playwright already installed. No testing-library dependency is needed. Routine Vite build writes tracked deploy-bound `dist-react`, so use scoped tests rather than a build as the default verification.

The pair endpoint explicitly selects sentence text and INO annotations, with `h.*` for legacy fields. It does not explicitly supply title, source origin, section, revision or model version. Their live availability and legacy provenance remain unverified; v1 must represent them as unknown.

## Verified pagination prerequisite

An in-memory SQLite fixture reproduced the cardinality of the endpoint's base COUNT and post-join LIMIT. It contained two base pair rows and three INO annotations on the first sentence. Executing the equivalent bidirectional pair condition and `LIMIT 2 OFFSET 0` returned:

```text
{'api_base_row_total': 2,
 'joined_page_rows': [(1, 101, 'INO:1'), (1, 101, 'INO:2')],
 'unique_pairs_on_first_page': 1}
```

This verifies a structural pagination risk for one-to-many annotation input, not its incidence in the live corpus.

Minimum compatible correction, confined to this feature:

1. Keep counting base pair rows as today.
2. Fetch the requested base pair page with sentence text before fetching INO annotations. Apply deterministic ordering with a unique base-record tie-breaker; verify the documented `h.id` key against available schema evidence during implementation.
3. Fetch annotations only for the returned sentence IDs with parameterized placeholders. No whole annotation-table aggregation.
4. Attach deterministic `ino_annotations: [{ino_id, matching_phrase}]`; preserve the existing scalar `ino_id` and `matching_phrase` as the first deterministic annotation for old clients.
5. Keep the existing response envelope and `total` semantics. Do not label it a unique-sentence or paper count.
6. Avoid unrelated filter, scoring or trend endpoint changes.

If the base key or sentence join uniqueness cannot be established, resolve that uncertainty before claiming safe pagination; frontend grouping cannot repair skipped server rows.

## User flow

1. An edge opens the existing evidence preview; its link opens GenePair.
2. GenePair groups loaded evidence by validated PMID. Missing/invalid PMID is shown under “Paper unavailable,” with no PubMed link.
3. A group shows PMID, loaded distinct-sentence count, expandable exact sentence text, model scores and detected sentence-level INO phrases.
4. Each evidence item has a checkbox. “Select loaded evidence from this paper” is explicitly limited to retrieved items.
5. “Load next page” requests a real server page and appends it. Distinguish loaded base-record count from deduplicated sentence count. A group can span several pages.
6. Local filtering says “Search loaded evidence”; it does not change or imply whole-corpus coverage.
7. Selected evidence exports as CSV or lossless JSON. No automatic prediction, LLM call or paper metadata fetch occurs.

At a loading/selection limit, explain the limit and preserve existing selections. Never silently truncate or call a retrieved subset a complete literature review.

## Identity, grouping and shared-state contract

Canonicalize pair orientation without changing the exact sentence text. Use an unambiguous encoded tuple:

```text
canonicalPair = sorted uppercase gene symbols
identityTuple = [canonicalPair, sentenceIdAsString, pmidAsString, exactSentenceText]
key = JSON.stringify(identityTuple)
```

Do not concatenate fields with a delimiter or trust an imported key/hash. Recompute the tuple from validated fields. Hash equality, if used for compact lookup, never replaces tuple and exact-text comparison. This is a client snapshot identity, not a new production ID.

- Collapse only exact tuple repeats; union their INO annotations without inflating sentence/paper counts.
- Same sentence ID with different text remains a distinct conflicting snapshot; do not overwrite a previous selected item.
- Preserve distinct recorded scores when the same exact tuple has conflicting values; show “Multiple recorded scores,” not a chosen maximum.
- Incomplete ID/text remains viewable and explicitly incomplete; do not promise it can be resolved later.
- PMID groups papers, not sentences or independent experiments.
- New pair/sort requests reset paging. Ignore stale responses with a request-generation guard.
- A page error leaves earlier data and selection intact. Selection persistence uses root's shared workspace context rather than a competing provider.

Proposed serializable record:

```json
{
  "schemaVersion": 1,
  "pair": ["GENEA", "GENEB"],
  "sentenceId": "123",
  "pmid": "456",
  "sentenceText": "Exact retrieved text.",
  "scores": [0.75],
  "inoAnnotations": [{"inoId": "INO:0000000", "matchingPhrase": "binds"}],
  "origin": null,
  "sourceRevision": null,
  "modelVersion": null,
  "fetchedAt": "2026-10-29T00:00:00Z"
}
```

ID, PMID and sentenceText permit null under explicit validation. Unknown provenance stays null; never label unknown records as abstract or body by inference. Do not store auth tokens or API keys. A restored snapshot is historical data; refresh is a separate user action that compares identity/text and surfaces differences rather than silently replacing selected evidence.

## Scientific interpretation and safe exports

- Use “BioBERT model score.” No calibration evidence was checked, so it must not be presented as the probability that an interaction is biologically true.
- Null, nonfinite or out-of-range scores render unavailable.
- INO annotations join on sentence ID. Call them “Detected INO phrases,” not verified pair-specific relation types.
- Co-mention, model prediction, causal direction and experimental validation are distinct. V1 does not infer activation/inhibition, contradiction or independent experimental replication.
- Whole-pair summary is labeled separately from loaded, filtered or selected evidence.
- Render text with React escaping, never sentence HTML injection. Validate positive decimal PMID before constructing an encoded PubMed URL; use `noopener noreferrer`.
- CSV quotes every cell, doubles embedded quotes, preserves newlines/UTF-8, and neutralizes spreadsheet formula/control prefixes in text fields. Exact original text remains available in JSON when CSV adds a defensive prefix.
- Export contains selection scope, retrieval timestamp and missing provenance. Use a safe filename and revoke Blob URLs.

## Implementation sequence and ownership

1. `api/routes/pairs.py` and focused `api/tests/test_pairs_evidence.py`: base pagination plus bounded annotation fetch.
2. `frontend/src/api.js`: optional backward-compatible paging/sort/includeSummary options.
3. New `frontend/src/evidenceUtils.js` and unit tests: keys, annotation merging, grouping, snapshot validation and CSV encoding.
4. New `frontend/src/components/EvidenceWorkbench.jsx`: bounded grouping/selection display.
5. `GenePair.jsx`: request state, stale-response protection, paging and workbench integration while retaining prediction/trend/graph behavior.
6. `EvidencePopup.jsx`: clarify limited preview scope and retain its full-pair link.
7. Integrate with root-approved shared workspace state. Root coordinates shared api.js and context edits with the other implementations.

## Acceptance criteria and checks

- Two base records with several INO annotations page correctly; all annotations are retained and base total remains two. Tied scores have stable order.
- Reversed query pair returns equivalent underlying evidence without requiring raw storage orientation to change.
- Next-page action makes a new request. An old pair response cannot replace a newer pair's display.
- Three sentences from one PMID and one from another count as two loaded papers; missing PMID does not become a paper or experiment claim.
- Selection survives paging/filter changes and export contains exactly selected snapshots, not hidden fetched records.
- Null ID/text/score, duplicate annotations, conflicting scores/text, HTML-like text and spreadsheet formula prefixes have focused unit fixtures.
- Boundaries prevent excess load/selection without losing prior state.
- A mocked Playwright journey exercises popup to pair, next page, selection, export and keyboard controls. No production DB/model server required.
- Run scoped new API tests, scoped Vitest utilities, then the affected Playwright journey. If broader existing checks fail, attribute baseline versus new change before claiming a regression.

## Alternatives and gaps

Frontend-only grouping of the first response is smaller but cannot deliver reliable paging with the observed join cardinality. A dedicated paper-pagination endpoint could supply actual whole-pair paper counts but expands query/API scope; defer it. Metadata hydration and AI evidence assessment add network and scientific-interpretation requirements; defer them.

Live schema key/index verification, actual pair cardinalities, workload performance, legacy provenance, score calibration and whole-corpus evidence completeness were not measured in this independent planning task. No production changes, schema migration, implementation or test-suite pass is claimed.
