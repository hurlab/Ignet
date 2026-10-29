# Independent code review: research workbench v1

Initial disposition: **CHANGES REQUIRED**. Focused fix rechecks will be appended below; only a later explicit final disposition supersedes open findings.

Reviewer: independent_plan_review, independent of the three feature implementation owners. Review baseline is the current uncommitted implementation in `/home/juhur/.moai/worktrees/projects/Ignet/research-workbench` on base `a2d471c`. Scope is the authorized experiment overlay, evidence review and portable workspace implementation. No source changes were made by this reviewer.

## Mechanically confirmed findings

### C1 — High, root already reproduced/fixed: unrelated workspace edits invalidate the active experiment

Original context `edit()` validated/reconstructed the whole workspace. This changed the unchanged experiment object on `setRecipe`, while Enrichment's reset effect depended on experiment identity. Root independently reproduced analysis self-cancellation in its browser journey and assigned the fix. Current implementation has `validateWorkspaceEdit(previous,candidate)` preserving unchanged validated experiment identity; the focused workspace test passed in this review. This finding is recorded as resolved at the pure-state boundary; root's browser journey is the integration proof.

### C2 — Medium, parser fix rechecked: inherited header names were treated as recognized aliases

Actual parser calls before the fix:

```text
UNKNOWN HEADER ACCEPTED constructor {"rows":[{"gene":"TP53","inputSymbol":"TP53","log2FC":1,"padj":null}],"duplicates":0}
UNKNOWN HEADER ACCEPTED __proto__ {"rows":[{"gene":"TP53","inputSymbol":"TP53","log2FC":1,"padj":null}],"duplicates":0}
```

Inputs were `gene,log2FC,constructor\nTP53,1,ignored` and the same with `__proto__`. A normal object alias table admitted inherited properties and silently ignored the additional field. The owner changed lookup to `Object.hasOwn`, with regression fixtures. The scoped experiment tests passed in this review. This was a header-validation error; no code execution or prototype mutation was demonstrated.

### C3 — Medium, open: failed experiment application silently discards the validated input

`ExperimentImport.apply()` calls `setExperiment(...)`, whose context API returns false on validation/storage-envelope bounds, but the component unconditionally clears its preview/text/error. The Gene Set page does not render the workspace persistence error there.

Independent local Chromium reproduction:

1. Import a valid 2,021,101-byte workspace containing 100 selected excerpts of 20,000 characters each. This is within the agreed file/excerpt/total bounds.
2. Navigate within the SPA to Gene Set; preview a valid experiment containing 500 distinct valid 60-character gene symbols.
3. Apply it. The combined workspace now exceeds 2 MiB and context correctly rejects the change.
4. UI nevertheless clears both entered text and preview, displays no alert and has no active experiment.

Actual browser output:

```text
APPLY_FAILURE_UI {"applyButtons":0,"inputLength":0,"alerts":[],"active":[]}
```

Required fix: observe the boolean result, keep the text/preview on failure and show an actionable error. Retain the prior active dataset. Add the combined-size rejection browser case or a component-level equivalent. The failure is a valid workspace-boundary outcome, not a reason to relax the cap.

### C4 — Medium, open: any prior restore suppresses later ordinary Enrichment deep links

The new initial input and auto-analyze conditions use the lifetime-global `restoreToken`/experiment presence rather than distinguishing restore-origin navigation from a later ordinary link. Plan 00 explicitly retains ordinary public deep-link behavior.

In the same local browser, after a workspace restore, navigate within the SPA to `/ignet/enrichment?genes=EGFR,STAT3`. The entered genes remain the restored recipe (empty in the fixture), and the public query is ignored:

```text
ENRICH_TEXTAREAS [ '' ]
ENRICH_INPUT
```

Required fix: give explicit query input precedence on an ordinary new entry while preserving clean-path restore's no-query behavior. Mark restore-origin navigation explicitly or consume a bounded restore signal; do not suppress every future query merely because a workspace was once restored. Include both clean restore/no-request and later ordinary query-link cases. The fixture used SPA history navigation to preserve provider state, equivalent to an in-app navigation rather than a full browser reload.

### C5 — Medium, open: annotation allowance differs between the API and the evidence renderer

The new API deliberately preserves all distinct annotations for each paged sentence. `validateEvidenceSnapshot` caps annotations at 100, while `normalizeEvidence` validates every fetched item in one all-or-nothing pass. A single otherwise valid sentence with 101 annotations rejects the entire loaded page, including other valid evidence.

Actual node-module fixture result:

```text
NORMALIZE ENTIRE PAGE REJECTED Invalid evidence annotations.
```

The fixture supplied two API-shaped rows: one with 101 distinct INO annotations and one with none. No live corpus incidence is asserted. Required resolution: choose a justified bounded allowance shared by API/snapshot/rendering, or explicitly isolate an oversized unselectable item while keeping other retrieved evidence visible. Do not silently truncate annotations or claim complete evidence. Overall workspace byte bounds remain required.

### C6 — Medium, open: a valid near-limit draft cannot be exported

`validateWorkspace` admits based on compact `JSON.stringify(workspace)` bytes, while `serializeWorkspace` pretty-prints with indentation and then applies the same byte cap. A valid admitted draft can therefore fail the explicit export/recovery path.

Actual pure-module reproduction: 100 excerpts with 20,000-character text and one 600-character detected phrase each:

```text
VALID NORMALIZED BYTES 2084802 LIMIT 2097152
EXPORT REJECTED Workspace exceeds 2 MiB.
```

Required fix: use one bounded canonical export encoding, e.g. compact JSON, or validate admission against the exact exported representation. Include a near-limit valid round-trip case. The library and individual file caps should remain unchanged.

## Verification run by this reviewer

Command, in this worktree's frontend directory:

```text
npm test -- --maxWorkers=2 src/__tests__/experimentData.test.js src/__tests__/evidenceUtils.test.js src/__tests__/workspace.test.js
Test Files  3 passed (3)
Tests  34 passed (34)
```

Command, in this worktree:

```text
PYTHONDONTWRITEBYTECODE=1 /tmp/ignet-workbench-venv/bin/python -m pytest -q -p no:cacheprovider api/tests/test_pairs_evidence.py
3 passed in 0.15s
```

The API test executes the real route against an in-memory SQLite fixture with stable tied-score IDs, reversed pair orientation, one-to-many annotations, null sentence IDs and an empty page. It establishes this route's bounded fixture behavior; it does not establish live MariaDB compatibility or performance.

Browser repros were inline Playwright scripts with a separate local Vite process on port 5199, intercepted `/api/**` requests and temporary Chromium contexts. Browser and server processes were cleaned in `finally`. No production endpoint was invoked. The original script timed out on an unavailable navigation label and cleaned up; the subsequent history-navigation version produced C3/C4 outputs above.

## Positive checks and limits

Source inspection confirms base-row pagination precedes text/annotation hydration; the existing response envelope/scalars remain and the full annotation array is added. Strict workspace allowlists, exact snapshot identity, React text rendering, safe selected-evidence CSV, explicit local persistence and separate legacy storage namespace align with the approved design. Root's shared identity fix also covers Save, not only recipe edits, in the inspected current code.

This reviewer did not independently rerun the entire browser acceptance suite, all existing frontend/API tests, full lint, live production schema verification, load measurements or deployment. Root's additional browser tests and screenshots must retain their own attribution. No mining/staging job was touched. Global result completeness and immutable historical database reproduction remain outside this feature.

## Residual risk

Runtime integration is still in progress. A passing pure validator test cannot establish asynchronous page restore, quota UI or graph-position stability. The concrete C3–C6 boundaries need focused fixes/rechecks before final approval; broader redesign is unnecessary.

## Focused fix rechecks and final disposition

Final disposition: **APPROVE for the bounded, uncommitted v1 implementation.** This supersedes the initial changes-required disposition. No open implementation blocker remains among C1–C6 after the checks below. This is not approval to deploy, modify production data or claim immutable historical result reproduction.

Independent checks performed against the fixes in this same worktree:

```text
PASS C2: constructor rejected
PASS C2: __proto__ rejected
PASS C3: failed apply preserves exact input/preview and shows2MiB alert
PASS C4: ordinary post-restore query hydrates EGFR,STAT3 and explicitly dispatches matching genes
PASS C5: 101 annotations preserved and second row remains visible
PASS C5: >5000 annotations isolated with exact text; valid row preserved
PASS C6: valid near-limit draft exports/reimports exactly; bytes=2084802
PASS rejected recipe: no query dispatched;500 typed inputs preserved; actionable alert visible
```

- C1: `validateWorkspaceEdit` preserves the unchanged experiment reference in edits and Save. Its focused test passes; root separately exercised the full experiment/overlay browser flow. This review does not reattribute root's graph geometry proof to itself.
- C2: direct calls to the actual parser reject both formerly accepted inherited-property headers.
- C3: the original large-workspace browser fixture now preserves the full 500-row entered table and Apply preview, and visibly reports the combined workspace byte error.
- C4: a fresh independent browser fixture restores a workspace, then makes an ordinary in-app `?genes=EGFR,STAT3` entry. It shows those input genes and sends the matching analysis request. Clean restore remains covered by root's acceptance journey, not presumed from this direct-link case.
- C5: actual module calls preserve all 101 annotations. Above the new bounded 5,000-annotation snapshot allowance, `prepareEvidenceReview` retains the exact excerpt as explicitly unselectable and preserves the valid sibling. The UI renders that warning; annotations are not silently represented as complete truncated data.
- C6: compact serialization produces the exact same 2,084,802-byte valid document and reparses to identical normalized semantic content. The cap itself is unchanged.
- The related Enrichment return-value guard was also independently exercised: a valid near-limit restored draft plus 500 typed long symbols cannot accept a new recipe; no analysis request is dispatched, all typed input remains and a visible error explains the outcome.

The browser rechecks used a separate local Vite/Chromium process with intercepted API requests and cleanup in `finally`, as above. One intermediate recheck used an overly strict label locator and timed out; the corrected label-based fixture produced the C4 PASS without changing implementation.

Final focused unit command, same three files as above:

```text
Test Files  3 passed (3)
Tests  37 passed (37)
```

The independently run route fixture remains `3 passed`; API code was unchanged since that measurement. Root's complete browser suite, wider frontend regression checks, changed-file lint and any temporary-output bundle verification retain root attribution and must be included in the completion evidence. Remaining limits are the documented 500-gene/loaded-row bounds, explicit-save semantics, browser-local storage, unknown provenance, no saved layout/full Dignet recipe, and no live deployment verification.
