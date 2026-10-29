# Implementation verification and root acceptance

## Claim

The bounded v1 for experimental gene overlays, paper-grouped evidence selection and explicit local workspaces is implemented in the isolated worktree. Three separate agents authored independent feature plans. A fourth independent reviewer required plan amendments R1–R3, then approved them before root authorized implementation. The same non-author reviewer inspected the implementation, reproduced six findings C1–C6, and approved after targeted fixes and independent rechecks. Root accepts the locally verified implementation below. No deployment, commit, push, live database write, production publication or SciMiner execution change is claimed.

## Evidence

Measured in this run against the implementation tree:

```text
cd frontend && npm test -- --maxWorkers=2
Test Files  8 passed (8)
Tests       71 passed (71)
```

```text
/tmp/ignet-workbench-venv/bin/python -m pytest api/tests/test_pairs_evidence.py api/tests/test_pair_canonicalization.py api/tests/test_sanitize.py -q
22 passed in 0.20s
```

The scoped API fixtures execute the route with a controlled database adapter. They verify base-row paging before annotation fanout, tied-score ordering, reversed pair orientation, null IDs, empty pages and compatibility fields without querying production.

```text
cd frontend && node node_modules/@playwright/test/cli.js test --config playwright.workbench.config.js
7 passed (11.1s)
```

The seven local API-mocked browser journeys cover:

1. Rejected experiment Apply preserves input/preview and shows the total-workspace size error.
2. Ordinary initial and post-restore gene-list deep links still execute the requested symbols under StrictMode.
3. Invalid recipe inputs dispatch no analysis; duplicate symbols normalize to unique inputs.
4. Valid-but-over-cap recipe changes retain all typed genes and dispatch no analysis.
5. Experiment values stay out of request URLs/bodies; explicit analysis, overlay, save, reload and lossless JSON export succeed. Overlay preserves node positions, viewport, edge selection, topology and edge data after the initial layout settles.
6. Evidence grouping requests a real next page and exports exactly selected Unicode excerpts; snapshots remain available on the workspace page.
7. Import restores inputs without querying; a late non-abortable fallback response cannot overwrite the restored input, loading state or displayed results.

Scoped ESLint ran on every new JS/JSX module, the changed API wrapper/main/App/catalogue, changed graph/popup/GeneSet/Enrichment/GenePair pages, new unit tests, both browser specs and the isolated Playwright configuration. Observed exit 0 with no diagnostics. Dignet was measured separately against an ephemeral `HEAD` baseline copy:

```text
PASS: modified Dignet and HEAD baseline have identical lint findings
no-unused-vars: 'nodeCount' is assigned a value but never used.
react-hooks/exhaustive-deps: missing dependency 'result?.keywords'.
```

These two baseline findings were not changed by the overlay wiring. A globally lint-clean repository is not claimed.

```text
git -c core.whitespace=cr-at-eol diff --check
exit 0; no output
```

The `cr-at-eol` setting accounts for the pre-existing CRLF style in API sources; the patch preserves that style.

Readback/status at final verification:

```text
owned HEAD: a2d471c
owned branch: WT-research-workbench
primary HEAD: a2d471c
primary branch: main
primary git diff --name-only: empty
```

Feature source, tests and planning/review documents remain local and uncommitted in the owned tree. The launcher-generated `.codex/` is not a feature deliverable. No worktree was removed.

## Baseline attribution

Implementation baseline is `/home/juhur/.moai/worktrees/projects/Ignet/research-workbench`, branch `WT-research-workbench`, starting commit `a2d471c`. Its pre-change frontend baseline measured 5 files / 34 tests passing. The final counts above were freshly measured here after the fixes. Independent reviewer measurements are separately attributed in review 05 and do not substitute for root's final checks.

Declared npm lockfile dependencies were installed into this worktree, without package/lockfile changes. The matching Playwright headless shell was installed in the browser cache. The isolated Python test environment under `/tmp/ignet-workbench-venv` supplied the missing declared MySQL connector. No new application dependency was added. Playwright owned and cleaned up its Vite process.

## Gaps

- No live production schema query, MariaDB integration/performance measurement, production model call, production UI check or public deployment was performed.
- API schema compatibility targets the checked-in migration and preserved earlier schema evidence; it needs a fresh target check before deployment.
- The default deploy-bound build was intentionally not run. Vite served and compiled the implementation during the browser journeys.
- Saved recipes/excerpts do not freeze historical database contents. Graph positions, complete Dignet query/cohort restore, account-backed sharing, aliases/species conversion and multi-contrast datasets are outside this v1.
- Browser storage is bounded and local. Explicit export is the transfer/backup mechanism; unsaved work does not survive reload or disk loss.
- The tests do not establish calibrated interaction probability, causal direction, full-literature coverage or whole-PMC-run completion.

## Residual risk

Live resource demand, database schema drift and data-specific outliers remain deployment/integration risks. Production sentence identity and PMC publication are separate work. The implementation remains reviewable in an isolated branch without changing the primary checkout or running mining jobs.

## Root decision

APPROVED as the tested local v1 after independent plan and code review. All confirmed review findings are resolved within their measured boundaries. Deployment and integration into the shared branch remain separate actions.
