-- Rebuild t_vo_has_gene_data lookup table after data reload
-- This marks which VO IDs have gene associations (for Vignet tree highlighting)
-- Usage: mysql -u ignet ignet < scripts/04_rebuild_vo_gene_data.sql
--
-- Uses t_vo (new pubmed26n data, same corpus as t_gene_pairs)
-- Falls back to vo_sciminer_187_terms (older mining, different corpus) for extra coverage

DELETE FROM t_vo_has_gene_data WHERE 1=1;

-- Primary source: t_vo (pubmed26n — same corpus as t_gene_pairs, best PMID overlap)
INSERT INTO t_vo_has_gene_data (vo_id)
SELECT DISTINCT v.vo_id
FROM t_vo v
WHERE EXISTS (
  SELECT 1 FROM t_gene_pairs g WHERE g.pmid = v.pmid LIMIT 1
);

-- Secondary source: vo_sciminer_187_terms (older mining, different corpus)
INSERT IGNORE INTO t_vo_has_gene_data (vo_id)
SELECT DISTINCT s.voID
FROM vo_sciminer_187_terms s
WHERE EXISTS (
  SELECT 1 FROM t_gene_pairs g WHERE g.pmid = s.PMID LIMIT 1
);

SELECT COUNT(*) AS vo_ids_with_gene_data FROM t_vo_has_gene_data;
