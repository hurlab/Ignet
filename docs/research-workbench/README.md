# Experiment overlays, evidence review and local workspaces

This isolated implementation extends the existing Ignet SPA and pair-evidence API. It does not publish PMC staging data, allocate persistent sentence IDs or deploy the site.

## Research workflow

1. Open **Gene Set → Experiment values**. Paste or upload UTF-8 CSV, TSV or semicolon-separated text with a gene column and `log2FC`, `padj`, or both. Accepted headers (case-insensitive) include `gene`/`symbol`/`gene_name`, `log2FoldChange`/`logFC`, and `padj`/`FDR`/`adj.P.Val`/`qvalue`; an unnamed first column (R row names) counts as the gene column. Other columns such as `baseMean` or `pvalue` are ignored, so full DESeq2/edgeR/limma output can be pasted directly. Preview validation before Apply. At most 500 unique genes and 2 MiB; conflicting duplicates and invalid measurements are rejected. Symbol matching uses trim/uppercase only, not alias resolution.
2. Choose **Analyze these genes**, then explicitly **Analyze** in Enrichment. Gene symbols go to the existing API; uploaded measurement values remain in browser memory. Enable experimental log2FC colors to decorate gene fill. Degree still controls node size and literature evidence controls edges. Missing is not measured zero. Dignet can use the same optional active experiment.
3. Open a gene pair, directly or through an existing graph evidence preview. **Review evidence** groups retrieved excerpts by PMID, loads actual subsequent server pages and selects exact snapshots. The review is capped at 500 base records/pair and 100 selected excerpts/workspace. Scores are model outputs, not calibrated biological probabilities. Sentence-level INO phrases do not establish causality or relation direction.
4. Use **Workspaces** to explicitly Save, Load, Export or preview and Import a JSON document. It preserves inputs, overlay settings, selected pair context and exact selected evidence text. It does not freeze historical database results or graph positions. Loading/importing does not run analysis; **Open enrichment inputs** leads to an explicit new analysis using current data.

## Privacy and recovery

Experiment/evidence data is not automatically saved. Unsaved drafts are lost on reload. Saved libraries are browser-local; export JSON for transfer or backup. Exported files contain the research data. No account-backed sharing or private payload URLs are introduced. Existing gene-set storage is left separate.

The new library key is `ignet_workspaces_v1`. Limits are 20 saved workspaces, 2 MiB total library and per import/export, 100 excerpts, 20,000 characters/excerpt and 5,000 annotations/excerpt subject to the total byte bound. An oversized/invalid API evidence item remains visible with an explicit unselectable warning rather than hiding valid neighboring evidence. There is no silent annotation truncation.

Invalid imports preserve the active draft and library. Save/quota failures preserve the draft for export and previous saved bytes. External library changes block overwrite until explicitly reloaded. Browser storage is not a transactional collaboration service or a replacement for exported backups.

## Planning and independent reviews

- [Authoritative integration contract and root approval](00-integration-plan.md)
- [Independent experiment plan](01-experiment-plan.md)
- [Independent evidence plan](02-evidence-plan.md)
- [Independent workspace plan](03-workspace-plan.md)
- [Independent plan review and amendments](04-independent-plan-review.md)
- [Independent implementation review](05-independent-code-review.md)
- [Measured verification and remaining limits](06-validation.md)

## Local verification

From this worktree's `frontend/`, install the declared lockfile dependencies with `npm ci --ignore-scripts`, then run:

```sh
npm test -- --maxWorkers=2
node node_modules/@playwright/test/cli.js test --config playwright.workbench.config.js
```

The separate Playwright configuration owns a temporary Vite server on localhost:5198 and mocks API traffic. It does not use the default live-site E2E configuration. Install its matching Chromium headless shell if absent. Do not run the default build for a routine check: it writes tracked deployment artifacts to `dist-react/`.

API tests require the declared Python test dependencies and use fixtures, not production queries. Run the scoped command listed in validation 06.

## Deployment boundary

The API pagination patch targets the recorded `t_gene_pairs.id` primary key and unique `t_sentences.sentence_id` schema. The migration and preserved earlier schema observation support this contract; a fresh target-schema compatibility check remains a deployment prerequisite. Local mocked-browser/API-fixture verification does not establish live database performance, production model validity or historical reproducibility.
