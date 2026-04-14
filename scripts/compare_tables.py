#!/usr/bin/env python3
"""
Compare t_sentence_hit_gene2gene_Host vs t_sentence_hit_gene2gene_Host_2024.

Randomly selects 10,000 shared PMIDs and compares:
- Number of gene pairs per PMID
- Specific genes identified
- Gene pair overlap
- Sentence-level differences

Usage:
  python3 scripts/compare_tables.py

Requires: mysql-connector-python (available in api venv)
"""

import os
import random
import sys
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv
import mysql.connector

# Load DB credentials from .env
_env_path = Path(__file__).parent.parent / "biosummarAI" / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "ignet"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_DATABASE", "ignet"),
    "charset": "utf8mb4",
}

SAMPLE_SIZE = 10000


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def get_shared_pmids(conn):
    """Get PMIDs that exist in both tables."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT h.PMID
        FROM t_sentence_hit_gene2gene_Host h
        WHERE h.PMID IN (SELECT DISTINCT PMID FROM t_sentence_hit_gene2gene_Host_2024)
    """)
    pmids = [row[0] for row in cursor.fetchall()]
    cursor.close()
    return pmids


def get_gene_pairs_for_pmids(conn, table, pmids):
    """Get gene pairs and row counts for a list of PMIDs from a table."""
    if not pmids:
        return {}
    cursor = conn.cursor(dictionary=True)
    placeholders = ",".join(["%s"] * len(pmids))
    cursor.execute(f"""
        SELECT PMID, geneSymbol1, geneSymbol2, COUNT(*) AS sentence_count
        FROM {table}
        WHERE PMID IN ({placeholders})
        GROUP BY PMID, geneSymbol1, geneSymbol2
    """, tuple(pmids))

    result = defaultdict(list)
    for row in cursor.fetchall():
        result[row["PMID"]].append({
            "gene1": row["geneSymbol1"],
            "gene2": row["geneSymbol2"],
            "sentences": row["sentence_count"],
        })
    cursor.close()
    return result


def get_unique_genes_for_pmids(conn, table, pmids):
    """Get unique genes per PMID."""
    if not pmids:
        return {}
    cursor = conn.cursor(dictionary=True)
    placeholders = ",".join(["%s"] * len(pmids))
    cursor.execute(f"""
        SELECT PMID, geneSymbol1 AS gene FROM {table} WHERE PMID IN ({placeholders})
        UNION
        SELECT PMID, geneSymbol2 AS gene FROM {table} WHERE PMID IN ({placeholders})
    """, tuple(pmids) * 2)

    result = defaultdict(set)
    for row in cursor.fetchall():
        result[row["PMID"]].add(row["gene"])
    cursor.close()
    return result


def main():
    print("=" * 70)
    print("TABLE COMPARISON: Host vs Host_2024")
    print("=" * 70)

    conn = get_connection()

    # Step 1: Get shared PMIDs
    print("\n[1/4] Fetching shared PMIDs...")
    shared_pmids = get_shared_pmids(conn)
    print(f"  Total shared PMIDs: {len(shared_pmids):,}")

    # Step 2: Sample
    sample = random.sample(shared_pmids, min(SAMPLE_SIZE, len(shared_pmids)))
    print(f"  Sampled: {len(sample):,} PMIDs")

    # Step 3: Get gene pairs for each table
    print("\n[2/4] Fetching gene pairs from Host table...")
    host_pairs = get_gene_pairs_for_pmids(conn, "t_sentence_hit_gene2gene_Host", sample)

    print("[3/4] Fetching gene pairs from Host_2024 table...")
    host2024_pairs = get_gene_pairs_for_pmids(conn, "t_sentence_hit_gene2gene_Host_2024", sample)

    # Step 4: Get unique genes
    print("[4/4] Fetching unique genes per PMID...")
    host_genes = get_unique_genes_for_pmids(conn, "t_sentence_hit_gene2gene_Host", sample)
    host2024_genes = get_unique_genes_for_pmids(conn, "t_sentence_hit_gene2gene_Host_2024", sample)

    conn.close()

    # =========== Analysis ===========
    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)

    # PMIDs present in both
    pmids_in_host = set(host_pairs.keys())
    pmids_in_2024 = set(host2024_pairs.keys())
    pmids_both = pmids_in_host & pmids_in_2024
    pmids_host_only = pmids_in_host - pmids_in_2024
    pmids_2024_only = pmids_in_2024 - pmids_in_host

    print(f"\n--- PMID Coverage (of {len(sample)} sampled) ---")
    print(f"  In Host only:      {len(pmids_host_only):,}")
    print(f"  In Host_2024 only: {len(pmids_2024_only):,}")
    print(f"  In both:           {len(pmids_both):,}")

    # Gene pair comparison
    total_host_pairs = 0
    total_2024_pairs = 0
    total_shared_pairs = 0
    total_host_only_pairs = 0
    total_2024_only_pairs = 0

    host_more_sentences = 0
    host2024_more_sentences = 0
    same_sentences = 0

    gene_overlap_ratios = []
    pair_overlap_ratios = []
    sentence_ratios = []

    for pmid in pmids_both:
        # Gene pairs as sets of SORTED tuples (order-independent: TNF-IFNG == IFNG-TNF)
        h_set = {tuple(sorted((p["gene1"], p["gene2"]))) for p in host_pairs[pmid]}
        h2_set = {tuple(sorted((p["gene1"], p["gene2"]))) for p in host2024_pairs[pmid]}

        shared = h_set & h2_set
        h_only = h_set - h2_set
        h2_only = h2_set - h_set

        total_host_pairs += len(h_set)
        total_2024_pairs += len(h2_set)
        total_shared_pairs += len(shared)
        total_host_only_pairs += len(h_only)
        total_2024_only_pairs += len(h2_only)

        if h_set | h2_set:
            pair_overlap_ratios.append(len(shared) / len(h_set | h2_set))

        # Gene overlap
        h_genes = host_genes.get(pmid, set())
        h2_genes = host2024_genes.get(pmid, set())
        if h_genes | h2_genes:
            gene_overlap_ratios.append(len(h_genes & h2_genes) / len(h_genes | h2_genes))

        # Sentence count comparison for shared pairs (aggregate both directions)
        h_sent_map = defaultdict(int)
        for p in host_pairs[pmid]:
            h_sent_map[tuple(sorted((p["gene1"], p["gene2"])))] += p["sentences"]
        h2_sent_map = defaultdict(int)
        for p in host2024_pairs[pmid]:
            h2_sent_map[tuple(sorted((p["gene1"], p["gene2"])))] += p["sentences"]

        for pair in shared:
            h_s = h_sent_map.get(pair, 0)
            h2_s = h2_sent_map.get(pair, 0)
            if h_s > h2_s:
                host_more_sentences += 1
            elif h2_s > h_s:
                host2024_more_sentences += 1
            else:
                same_sentences += 1
            if h2_s > 0:
                sentence_ratios.append(h_s / h2_s)

    print(f"\n--- Gene Pair Comparison (across {len(pmids_both):,} shared PMIDs) ---")
    print(f"  Total pairs in Host:      {total_host_pairs:,}")
    print(f"  Total pairs in Host_2024: {total_2024_pairs:,}")
    print(f"  Shared pairs:             {total_shared_pairs:,}")
    print(f"  Host-only pairs:          {total_host_only_pairs:,}")
    print(f"  Host_2024-only pairs:     {total_2024_only_pairs:,}")
    if total_host_pairs:
        print(f"  Host has {total_host_pairs / max(total_2024_pairs, 1):.2f}x more pairs")

    if pair_overlap_ratios:
        avg_pair_overlap = sum(pair_overlap_ratios) / len(pair_overlap_ratios)
        print(f"\n  Avg pair overlap (Jaccard per PMID): {avg_pair_overlap:.4f} ({avg_pair_overlap*100:.1f}%)")

    if gene_overlap_ratios:
        avg_gene_overlap = sum(gene_overlap_ratios) / len(gene_overlap_ratios)
        print(f"  Avg gene overlap (Jaccard per PMID): {avg_gene_overlap:.4f} ({avg_gene_overlap*100:.1f}%)")

    print(f"\n--- Sentence Count Comparison (for {total_shared_pairs:,} shared pairs) ---")
    print(f"  Host has more sentences:      {host_more_sentences:,}")
    print(f"  Host_2024 has more sentences: {host2024_more_sentences:,}")
    print(f"  Same sentence count:          {same_sentences:,}")
    if sentence_ratios:
        avg_ratio = sum(sentence_ratios) / len(sentence_ratios)
        print(f"  Avg Host/Host_2024 sentence ratio: {avg_ratio:.2f}x")

    # Summary
    print(f"\n{'=' * 70}")
    print("SUMMARY")
    print(f"{'=' * 70}")
    if gene_overlap_ratios:
        avg_go = sum(gene_overlap_ratios) / len(gene_overlap_ratios)
        if avg_go > 0.8:
            print("  Gene identification: HIGHLY CONSISTENT (>80% overlap)")
            print("  The two pipelines identify largely the same genes per document.")
        elif avg_go > 0.5:
            print("  Gene identification: MODERATELY CONSISTENT (50-80% overlap)")
            print("  The pipelines share most genes but differ on some identifications.")
        else:
            print("  Gene identification: SIGNIFICANTLY DIFFERENT (<50% overlap)")
            print("  The pipelines identify substantially different gene sets.")

    if pair_overlap_ratios:
        avg_po = sum(pair_overlap_ratios) / len(pair_overlap_ratios)
        if avg_po > 0.8:
            print("  Pair identification: HIGHLY CONSISTENT (>80% overlap)")
        elif avg_po > 0.5:
            print("  Pair identification: MODERATELY CONSISTENT (50-80% overlap)")
        else:
            print("  Pair identification: SIGNIFICANTLY DIFFERENT (<50% overlap)")
            print("  The Host table identifies many more pairs, possibly due to")
            print("  different sentence splitting or gene co-occurrence window settings.")

    print()


if __name__ == "__main__":
    main()
