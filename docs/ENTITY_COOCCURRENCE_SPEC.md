# Entity Co-occurrence Pair Generation Specification

**Purpose:** Generate PMID-level co-occurrence pair files from SciMiner mining output for loading into the Ignet/Vignet database. These pairs enable multi-entity network visualization (vaccine-gene, drug-gene, disease-gene, and cross-entity links).

**Target machine:** hurlab04.med.und.edu
**Source data:** SciMiner MEDLINE Base 2026 output (date tag: 260317)
**Destination:** Transfer files to ignet server for database loading

---

## 1. Source Files

All files are tab-delimited with a header row (`#` prefix).

| Entity | File | Key Columns | Rows | Distinct PMIDs |
|--------|------|-------------|------|----------------|
| **Gene** (Host) | `SciMiner-Host_260317-Details.txt` | col2=PMID, col5=Symbol | 11,924,513 | 3,120,788 |
| **Vaccine** (VO) | `SciMiner-VO_260317-Details.txt` | col2=PMID, col4=VO_ID, col5=MatchTerm | 586,455 | 240,127 |
| **Drug** (DrugBank) | `SciMiner-DrugBank_260317-PMID2DrugBank-Detail.txt` | col1=PMID, col2=DrugBankID, col3=DrugTerm | 7,071,575 | 5,122,928 |
| **Disease** (HDO) | `SciMiner-HDO_260317-PMID2HDO-Detail.txt` | col1=PMID, col2=HDO_ID, col3=HDOTerm | 18,817,630 | 12,176,318 |
| **Interaction** (INO) | `SciMiner-INO_260317-Details.txt` | col2=PMID, col4=INO_ID, col5=MatchTerm | 42,578,113 | 10,277,571 |

### Column Details

**Host (Gene) file:**
```
#SentID  PMID  Type  HUGOID  Symbol  MatchTerm  ActualTerm  Sentence
47508    10611 SYMBOL 4827   HBB     hemoglobin  hemoglobin  ...
```
- Use col2 (PMID) and col5 (Symbol) for gene identity
- Ignore col3=Type, col4=HUGOID, col6-8

**VO (Vaccine) file:**
```
#SentID  PMID  ID_Type  ID          MatchTerm  Sentence
4390     987   VO       VO_0000001  vaccine    ...
```
- Use col2 (PMID), col4 (VO_ID), col5 (MatchTerm)

**DrugBank file:**
```
#PMID      DrugBankID  DrugTerm
21378115   DB02679     cyanamide
```
- Use col1 (PMID), col2 (DrugBankID), col3 (DrugTerm)

**HDO (Disease) file:**
```
#PMID      HDOID       HDOTerm
36395562   DOID:824    periodontitis
```
- Use col1 (PMID), col2 (HDO_ID), col3 (HDOTerm)

---

## 2. Output Files to Generate

### Priority 1: Vaccine-Gene (required for VacNet)

**File:** `CoOccurrence-VO_Gene_260317.txt`

```
#VO_ID       GeneSymbol  SharedPMIDs  VO_Term          GeneTerm
VO_0004908   IFNG        142          covid-19 vaccine interferon gamma
VO_0004908   IL6         98           covid-19 vaccine interleukin 6
```

**Logic:** For each (VO_ID, GeneSymbol) pair that share at least 1 PMID, output one row with the count of shared PMIDs. Use the most frequent MatchTerm for each entity as the display label.

**Generation approach:**
1. Extract unique (PMID, VO_ID, VO_MatchTerm) from VO Details file
2. Extract unique (PMID, GeneSymbol, GeneMatchTerm) from Host Details file
3. Inner join on PMID
4. Group by (VO_ID, GeneSymbol), count distinct shared PMIDs
5. Pick the most frequent MatchTerm for each VO_ID and GeneSymbol

### Priority 2: Drug-Gene

**File:** `CoOccurrence-Drug_Gene_260317.txt`

```
#DrugBankID  GeneSymbol  SharedPMIDs  DrugTerm   GeneTerm
DB01050      TNF         523          ibuprofen  tumor necrosis factor
```

**Logic:** Same approach — join DrugBank and Host on PMID, group by (DrugBankID, GeneSymbol).

### Priority 3: Disease-Gene

**File:** `CoOccurrence-HDO_Gene_260317.txt`

```
#HDO_ID      GeneSymbol  SharedPMIDs  HDOTerm        GeneTerm
DOID:162     TP53        4521         cancer         tumor protein p53
```

**Logic:** Same approach — join HDO and Host on PMID, group by (HDO_ID, GeneSymbol).

### Priority 4: Vaccine-Drug

**File:** `CoOccurrence-VO_Drug_260317.txt`

```
#VO_ID       DrugBankID  SharedPMIDs  VO_Term          DrugTerm
VO_0004908   DB14902     87           covid-19 vaccine remdesivir
```

### Priority 5: Vaccine-Disease

**File:** `CoOccurrence-VO_HDO_260317.txt`

```
#VO_ID       HDO_ID      SharedPMIDs  VO_Term          HDOTerm
VO_0004908   DOID:0080600 312         covid-19 vaccine COVID-19
```

### Priority 6: Drug-Disease

**File:** `CoOccurrence-Drug_HDO_260317.txt`

```
#DrugBankID  HDO_ID       SharedPMIDs  DrugTerm    HDOTerm
DB01050      DOID:8398    1432         ibuprofen   osteoarthritis
```

---

## 3. Generation Algorithm

For each pair type (EntityA_EntityB):

```
Step 1: Extract unique (PMID, EntityA_ID, EntityA_Term) from file A
        → sort by PMID → entityA_pmids.tmp

Step 2: Extract unique (PMID, EntityB_ID, EntityB_Term) from file B
        → sort by PMID → entityB_pmids.tmp

Step 3: Join on PMID
        join -t $'\t' -1 1 -2 1 entityA_pmids.tmp entityB_pmids.tmp > joined.tmp

Step 4: Aggregate
        Group by (EntityA_ID, EntityB_ID)
        Count distinct PMIDs as SharedPMIDs
        Pick most frequent term for each entity

Step 5: Filter
        Keep only pairs with SharedPMIDs >= 1
        Sort by SharedPMIDs descending
```

### Performance Notes

- The Host file (11.9M rows) is the largest. Extract PMID + Symbol first, deduplicate, then join.
- For Gene, deduplicate at PMID level: one PMID may mention the same gene in multiple sentences — count it once.
- For VO, same deduplication: one PMID may mention the same VO_ID in many sentences.
- DrugBank and HDO files are already at PMID level (no SentID), but may have duplicates.
- Use `sort -T /tmp` with a temp directory if memory is limited.
- Expected output sizes:
  - VO-Gene: ~50K-200K pairs (638 VOs x potentially many genes)
  - Drug-Gene: could be very large (5.1M drug PMIDs x 3.1M gene PMIDs)
  - HDO-Gene: could be very large
  - Consider a minimum SharedPMIDs threshold (e.g., >= 2) for Drug-Gene and HDO-Gene to keep file sizes manageable

### Minimum Threshold Recommendations

| Pair Type | Min SharedPMIDs | Rationale |
|-----------|----------------|-----------|
| VO-Gene | 1 | Vaccine coverage is sparse, keep everything |
| Drug-Gene | 2 | Large overlap, filter noise |
| HDO-Gene | 2 | Very large overlap, filter noise |
| VO-Drug | 1 | Keep everything |
| VO-HDO | 1 | Keep everything |
| Drug-HDO | 3 | Extremely large, needs aggressive filtering |

---

## 4. Database Schema on Ignet Server

The ignet server will create these tables and load the files:

```sql
CREATE TABLE t_vo_gene (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    vo_id       VARCHAR(45) NOT NULL,
    gene_symbol VARCHAR(45) NOT NULL,
    shared_pmids INT NOT NULL,
    vo_term     VARCHAR(128),
    gene_term   VARCHAR(128),
    INDEX idx_vo_id (vo_id),
    INDEX idx_gene (gene_symbol),
    INDEX idx_pmids (shared_pmids)
);

-- Similar schema for other pair types:
-- t_drug_gene (drugbank_id, gene_symbol, shared_pmids, drug_term, gene_term)
-- t_hdo_gene (hdo_id, gene_symbol, shared_pmids, hdo_term, gene_term)
-- t_vo_drug (vo_id, drugbank_id, shared_pmids, vo_term, drug_term)
-- t_vo_hdo (vo_id, hdo_id, shared_pmids, vo_term, hdo_term)
-- t_drug_hdo (drugbank_id, hdo_id, shared_pmids, drug_term, hdo_term)
```

---

## 5. Existing Data (Already on Ignet)

These are already loaded and working:

| Table | Type | Level | Rows |
|-------|------|-------|------|
| `t_gene_pairs` | Gene-Gene | Sentence-level | 5,124,468 |
| `t_ino` | Gene-INO | Sentence-level | 42,578,113 |
| `t_vo` | VO mentions | Sentence-level | 586,455 |
| `t_drug` | Drug mentions | PMID-level | 7,071,575 |
| `t_hdo` | HDO mentions | PMID-level | 18,817,630 |

The co-occurrence files fill the gap: cross-entity associations that don't currently exist in the database.

---

## 6. Vision: Heterogeneous Knowledge Graph

The ultimate goal is a unified network where all entities connect:

```
        Gene ── Gene        (existing: t_gene_pairs, sentence-level)
       / |  \
      /  |   \
   VO  Drug  HDO            (new: PMID-level co-occurrence pairs)
    |  \  / \ |
    |   \/   \|
   VO─Drug  Drug─HDO        (new: cross-entity PMID co-occurrence)
    \       /
     VO──HDO                 (new: vaccine-disease co-occurrence)
```

Each edge type has a `shared_pmids` weight representing how many papers mention both entities. This enables:
- VacNet: "What genes are associated with this vaccine?" (VO-Gene)
- DrugNet: "What genes does this drug interact with?" (Drug-Gene)
- DiseaseNet: "What genes are involved in this disease?" (HDO-Gene)
- Cross-network: "What drugs are used with this vaccine?" (VO-Drug)
- Integrated view: Vaccine → Disease → Gene → Drug paths

---

## 7. Delivery

Transfer completed files to ignet server:
```bash
scp CoOccurrence-*_260317.txt juhur@ignet.org:/home/juhur/tmp/ignet_transfer_2026/
```

Notify the ignet agent to load files and update VacNet queries.

---

**Date:** 2026-03-30
**Author:** Junguk Hur / MoAI
**Status:** Ready for implementation on hurlab04
