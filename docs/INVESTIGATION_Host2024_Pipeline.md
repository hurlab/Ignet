# Investigation: t_sentence_hit_gene2gene_Host_2024 Pipeline Gap

## Summary

The `t_sentence_hit_gene2gene_Host_2024` table has BioBERT scores for all 4.3M rows, but is missing ~18 years of PubMed data (2002-2019). This document describes the findings and what to look for on the processing server (hurlab04).

---

## Findings

### Table Comparison

| Table | Rows | BioBERT Scored | Max PMID | Server |
|-------|------|---------------|----------|--------|
| `t_sentence_hit_gene2gene_Host` | 15,839,675 | 0 (0%) | 40,478,615 (2025) | Current production |
| `t_sentence_hit_gene2gene_Host_2024` | 4,293,106 | 4,293,106 (100%) | 38,294,829 (2024) | Processed on hurlab04 |

### Data Consistency (10,000 shared PMIDs sampled)

- Gene identification overlap: **99.99%** (identical genes per document)
- Gene pair overlap: **99.99%** (when accounting for A-B = B-A ordering)
- Sentence counts: **99.97% identical**
- Conclusion: **The SciMiner pipeline is consistent** — same genes, same pairs, same sentences

### Year Distribution Anomaly

The `_Host_2024` table has a severe gap in publication years:

| Year Range | Host (production) PMIDs | Host_2024 PMIDs | Status |
|------------|------------------------|-----------------|--------|
| 1965-2000 | ~2.6K → 54K/year | ~2.6K → 52K/year | **Match** — baseline files processed correctly |
| **2001** | **57,675** | **24,803** | **Partial** — drop mid-year |
| **2002-2019** | **58K-124K/year** | **~1K/year** | **MISSING** — 18 years of data not processed |
| 2020 | 118,957 | 7,688 | Partial |
| 2021 | 128,849 | 106,772 | Large but incomplete |
| 2022 | 124,237 | 60,133 | Partial |
| 2023 | 114,653 | 13,382 | Drops sharply |
| 2024 | 117,351 | 8,519 | Minimal |
| 2025 | 29,287 | 182 | Minimal |

### PMID Overlap

| Category | Count |
|----------|-------|
| Shared PMIDs | 827,273 |
| Unique to Host (production) | 1,824,611 |
| Unique to Host_2024 | 3,829 |

---

## Hypothesis: What Went Wrong

The year distribution pattern strongly suggests:

1. **PubMed baseline files for 1965-2000 were processed correctly** — these are the `pubmed26n0001` through `pubmed26n0XXX` files that cover the historical archive
2. **PubMed baseline files for 2001-2019 were NOT processed** — the pipeline appears to have skipped ~1,000 baseline XML files covering this period
3. **PubMed update files for 2020-2022 were partially processed** — the spike in 2021 (106K PMIDs) suggests update files were run, but not completely
4. **The ~1K PMIDs/year during 2002-2019** are likely from update files that incidentally contained corrections or additions to papers in those years

This pattern is consistent with:
- A baseline processing run that stopped or errored partway through (after the year-2000 files)
- Followed by processing of update files (which cover recent years)
- Without reprocessing or detecting that baseline files were skipped

---

## What to Check on hurlab04

### Directory: `/home/juhur/sciMiner_MEDLINE_Base_2024/`

1. **Check which baseline XML files were processed:**
   ```bash
   ls /home/juhur/sciMiner_MEDLINE_Base_2024/pubmed26n*.xml.gz | wc -l
   # Or check a processing log:
   ls /home/juhur/sciMiner_MEDLINE_Base_2024/logs/ 2>/dev/null
   cat /home/juhur/sciMiner_MEDLINE_Base_2024/*.log 2>/dev/null | tail -100
   ```

2. **Check for processing status/progress files:**
   ```bash
   find /home/juhur/sciMiner_MEDLINE_Base_2024/ -name "*.status" -o -name "*.progress" -o -name "*.done" -o -name "*.log" 2>/dev/null
   ```

3. **Check which file IDs were processed:**
   The `BASE_pmid2fileID.txt` maps PMIDs to file IDs (e.g., `pubmed26n0001`). Check which file IDs have results:
   ```bash
   # If there's a results directory with per-file outputs:
   ls /home/juhur/sciMiner_MEDLINE_Base_2024/results/ 2>/dev/null | sort -V | head -20
   ls /home/juhur/sciMiner_MEDLINE_Base_2024/results/ 2>/dev/null | sort -V | tail -20
   # Count total:
   ls /home/juhur/sciMiner_MEDLINE_Base_2024/results/ 2>/dev/null | wc -l
   ```

4. **Check for error logs around the gap period:**
   ```bash
   # Files corresponding to 2001-2019 PMIDs would be roughly file IDs 0300-1100
   # (based on PubMed baseline file numbering)
   grep -i "error\|fail\|skip\|abort" /home/juhur/sciMiner_MEDLINE_Base_2024/*.log 2>/dev/null
   ```

5. **Compare with the working 2025 pipeline:**
   ```bash
   # Check the 2025 directory for comparison
   ls /home/juhur/SciMiner_MEDLINE_Base_2025/ 2>/dev/null
   # How many files processed in 2025?
   ls /home/juhur/SciMiner_MEDLINE_Base_2025/results/ 2>/dev/null | wc -l
   ```

### Specific Questions to Answer

1. **How many PubMed baseline XML files exist in the 2024 directory?** (Expected: ~1,200+ files for full baseline)
2. **Is there a processing script/config showing which files to process?** (Look for `run.sh`, `config.py`, `Makefile`, or similar)
3. **Is there a file list or range specification?** (e.g., "process files 0001-0300" which would explain the cutoff)
4. **Are there error logs showing the pipeline crashed during processing?**
5. **Was the BioBERT scoring run BEFORE or AFTER the SciMiner extraction?** (If after, the missing data is a SciMiner issue, not BioBERT)

---

## Impact on Ignet 2.0

- The **production table** (`t_sentence_hit_gene2gene_Host`, 15.8M rows) is the correct, complete dataset covering all years
- BioBERT scores from `_Host_2024` can be migrated for the **827K shared PMIDs** (covering ~1965-2000 + partial 2020-2022)
- The remaining **1.8M PMIDs** (2002-2019 + 2023-2025) have no BioBERT scores
- **No need to reprocess** — the production table has all the gene pair data; only BioBERT scoring is missing for the gap years

---

## Recommended Action

1. **Immediate:** Copy scores from `_Host_2024` → `_Host` for the 827K shared PMIDs (~18% coverage)
2. **Later:** Run BioBERT batch scoring on the remaining unscored rows using the production BioBERT service (port 9635). Estimated: ~13M sentences, ~130K batches of 100
3. **Investigation:** Check hurlab04 to understand the 2024 pipeline gap for documentation purposes

---

*Generated: 2026-03-21*
*Source: Ignet database comparison analysis*
