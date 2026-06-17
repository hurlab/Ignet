# Ignet — Known Limitations & Future Work

## 1. Gene/protein identification lacks species (organism) disambiguation — FUTURE WORK

**Status:** Documented limitation, not yet addressed. Tracked for future work.

### Summary
Ignet's gene/protein identification is **dictionary-based named-entity normalization
against a human-only gene table** (`t_gene_info`, tax_id 9606). There is no organism
namespace for non-human (e.g., viral/pathogen) genes/proteins. As a result, when a
pathogen protein name coincides with a human gene symbol or alias, the mention is
**misattributed to the human gene**. Entities are not tagged with their source species.

### Concrete examples (observed in the live DB, 2026-06-16)
| Text mention (pathogen) | Misresolved to human gene | Collision cause | Approx. footprint |
|---|---|---|---|
| "SARS" (the virus) | `SARS` / `SARS2` (seryl-tRNA synthetase) | gene symbol *is* "SARS" | ~405 rows in `t_gene_pairs`; 21 rows in `t_cooccurrence_cov_gene` |
| coronavirus **NSP3** | `SH2D3C` (alias "NSP3") | human SH2D3C alias = NSP3 | ~22 rows / 79 shared PMIDs |
| coronavirus **NSP1** | `SH2D3A` (alias "NSP1") | human SH2D3A alias = NSP1 | ~19 rows / 40 PMIDs |
| coronavirus **NSP2** | `BCAR3` (alias "NSP2") | human BCAR3 alias = NSP2 | ~14 rows / 23 PMIDs |

Most `gene_term ≠ gene_symbol` cases are **correct** synonym normalizations
(`IFNG ← "IFN-gamma"`, `DDX58 ← "RIG-I"`, `IFIH1 ← "MDA-5"`, etc.); the issue is
limited to a small set of pathogen/human name collisions. Scale is minor
(~0.007% of `t_gene_pairs`), but real.

### Impact
- The host gene-gene network (`t_gene_pairs`) contains a few pathogen mentions
  (e.g., "SARS") as if they were human gene nodes.
- In the CoV-protein overlay (`t_cooccurrence_cov_gene`), the "host gene" side is
  occasionally itself a misresolved viral protein (e.g., `SH2D3C` = viral NSP3).

### Partial mitigation already in place
- The Dignet CoV overlay (`GET /dignet/<id>/cov-genes`, shipped 2026-06-16)
  **excludes the `SARS`/`SERS` artifact**. It does NOT yet exclude the
  NSP1/NSP2/NSP3 → SH2D3A/BCAR3/SH2D3C collisions.

### Proposed future work
1. **Species tagging:** carry an organism/tax_id (or a host-vs-pathogen flag) on
   recognized entities, so genes/proteins can be filtered and visualized by species.
2. **Collision blocklist (short term, app side):** maintain a small list of known
   viral-name collisions (`SARS`/`SARS2` when the match is the virus; `NSP1–16`
   when matched as bare viral non-structural proteins) and exclude/flag them in
   Dignet networks and the CoV overlay.
3. **Evidence transparency:** surface `gene_term` (the literal matched phrase) in
   node/edge tooltips so users can judge mapping quality.
4. **Pipeline-side fix (root cause, separate repo `SciMiner_MEDLINE_2026`):**
   organism-aware NER/NEN so "NSP3 (viral)" vs "NSP3 (human alias)" disambiguate by
   context and taxonomy — the durable solution.

---
_Last reviewed: 2026-06-16._
