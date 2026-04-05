-- Ignet Database Migration: pubmed25n → pubmed26n
-- Rename tables, rename columns to snake_case, drop legacy columns, add missing PKs
-- Run AFTER full backup is verified
-- Usage: mysql -u ignet ignet < scripts/01_rename_tables.sql

-- =========================================================================
-- Step 1: Rename tables
-- =========================================================================

RENAME TABLE t_sentence_hit_gene2gene_Host TO t_gene_pairs;
RENAME TABLE sentences25_genepair TO t_sentences;
RENAME TABLE sentences25_Host TO t_sentences_host_legacy;
RENAME TABLE ino_host25 TO t_ino;
RENAME TABLE vo_host25 TO t_vo;
RENAME TABLE drug_host TO t_drug;
RENAME TABLE hdo_host TO t_hdo;

SELECT 'Step 1 done: tables renamed' AS status;

-- =========================================================================
-- Step 2: t_gene_pairs — drop legacy columns, rename PK + columns to snake_case
-- =========================================================================

ALTER TABLE t_gene_pairs
    DROP COLUMN keywords,
    DROP COLUMN hasFever,
    DROP COLUMN in_ifng_network,
    DROP COLUMN in_casp2_network,
    DROP COLUMN c_hit_id,
    CHANGE gene2gene_host_id id BIGINT(20) NOT NULL AUTO_INCREMENT,
    CHANGE PMID pmid INT(10) UNSIGNED,
    CHANGE sentenceID sentence_id INT(10) UNSIGNED,
    CHANGE geneSymbol1 gene_symbol1 VARCHAR(45),
    CHANGE geneSymbol2 gene_symbol2 VARCHAR(45),
    CHANGE geneMatch1 gene_match1 VARCHAR(128),
    CHANGE geneMatch2 gene_match2 VARCHAR(128),
    CHANGE hasVaccine has_vaccine TINYINT(1);

SELECT 'Step 2 done: t_gene_pairs cleaned' AS status;

-- =========================================================================
-- Step 3: t_sentences — rename columns to snake_case
-- =========================================================================

ALTER TABLE t_sentences
    CHANGE sentenceID sentence_id INT(11) NOT NULL,
    CHANGE PMID pmid INT(11) NOT NULL;

SELECT 'Step 3 done: t_sentences cleaned' AS status;

-- =========================================================================
-- Step 4: t_ino — rename ambiguous 'id' column, then add PK (two statements for MariaDB)
-- =========================================================================

ALTER TABLE t_ino CHANGE id ino_id VARCHAR(45);
ALTER TABLE t_ino ADD COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;

SELECT 'Step 4 done: t_ino cleaned' AS status;

-- =========================================================================
-- Step 5: t_vo — rename ambiguous 'id' column, then add PK (two statements for MariaDB)
-- =========================================================================

ALTER TABLE t_vo CHANGE id vo_id VARCHAR(45);
ALTER TABLE t_vo ADD COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;

SELECT 'Step 5 done: t_vo cleaned' AS status;

-- =========================================================================
-- Step 6: t_drug and t_hdo — already snake_case, no changes needed
-- =========================================================================

SELECT 'Step 6 done: t_drug and t_hdo unchanged (already clean)' AS status;

-- =========================================================================
-- Verify final schemas
-- =========================================================================

SELECT '=== Final Schemas ===' AS '';
DESCRIBE t_gene_pairs;
SELECT '' AS '';
DESCRIBE t_sentences;
SELECT '' AS '';
DESCRIBE t_ino;
SELECT '' AS '';
DESCRIBE t_vo;
SELECT '' AS '';
DESCRIBE t_drug;
SELECT '' AS '';
DESCRIBE t_hdo;

-- =========================================================================
-- Legacy Compatibility VIEWs
-- Created to keep ignet_legacy PHP site functional after table renames.
-- These VIEWs map old table/column names to the new snake_case tables.
-- No data duplication — legacy site sees the same current data.
-- =========================================================================

CREATE OR REPLACE VIEW t_sentence_hit_gene2gene_Host AS
SELECT id, pmid AS PMID, sentence_id AS sentenceID,
       gene_match1 AS geneMatch1, gene_match2 AS geneMatch2,
       gene_symbol1 AS geneSymbol1, gene_symbol2 AS geneSymbol2,
       score, has_vaccine AS hasVaccine
FROM t_gene_pairs;

CREATE OR REPLACE VIEW sentences25_genepair AS
SELECT sentence_id AS sentenceID, pmid AS PMID, sentence
FROM t_sentences;

CREATE OR REPLACE VIEW biosummary25_Host AS
SELECT * FROM t_biosummary;

CREATE OR REPLACE VIEW ino_host25 AS
SELECT sentence_id, pmid, ino_id AS id, matching_phrase
FROM t_ino;

SELECT 'Legacy VIEWs created' AS status;
