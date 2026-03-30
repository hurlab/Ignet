/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.5.29-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: ignet
-- ------------------------------------------------------
-- Server version	10.5.29-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `encrypted_key` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_provider` (`user_id`,`provider`),
  CONSTRAINT `api_keys_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `biosummary25_Host`
--

DROP TABLE IF EXISTS `biosummary25_Host`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `biosummary25_Host` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pmid` int(11) NOT NULL,
  `sentences` text DEFAULT NULL,
  `drug_term` varchar(2048) DEFAULT NULL,
  `hdo_term` varchar(2048) DEFAULT NULL,
  `gene_symbols` varchar(2048) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pmid_summary` (`pmid`),
  KEY `idx_gene_symbols` (`gene_symbols`(100))
) ENGINE=InnoDB AUTO_INCREMENT=2686936 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `covid_details`
--

DROP TABLE IF EXISTS `covid_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `covid_details` (
  `sentence_id` int(11) DEFAULT NULL,
  `pmid` int(11) DEFAULT NULL,
  `id` varchar(45) DEFAULT NULL,
  `matching_phrase` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ino_details_new`
--

DROP TABLE IF EXISTS `ino_details_new`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ino_details_new` (
  `sentence_id` int(11) DEFAULT NULL,
  `pmid` int(11) DEFAULT NULL,
  `id` varchar(45) DEFAULT NULL,
  `matching_phrase` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `old_host_details`
--

DROP TABLE IF EXISTS `old_host_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `old_host_details` (
  `sentence_id` int(11) DEFAULT NULL,
  `pmid` int(11) DEFAULT NULL,
  `gene_symbol` varchar(45) DEFAULT NULL,
  `hugo_id` int(11) DEFAULT NULL,
  `matching_phrase` varchar(128) DEFAULT NULL,
  `actual_term` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `old_vo_details`
--

DROP TABLE IF EXISTS `old_vo_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `old_vo_details` (
  `sentence_id` int(11) DEFAULT NULL,
  `pmid` int(11) DEFAULT NULL,
  `id_type` varchar(45) DEFAULT NULL,
  `id` varchar(45) DEFAULT NULL,
  `matching_phrase` varchar(128) DEFAULT NULL,
  `sentence` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sentence`
--

DROP TABLE IF EXISTS `sentence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sentence` (
  `sentence_id` int(10) NOT NULL,
  `pmid` int(11) DEFAULT NULL,
  `sentence` text DEFAULT NULL,
  PRIMARY KEY (`sentence_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sentence_gene`
--

DROP TABLE IF EXISTS `sentence_gene`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sentence_gene` (
  `sentence_id` int(10) unsigned NOT NULL,
  `gene_symbol` varchar(45) NOT NULL,
  `matching_phrase` varchar(128) NOT NULL,
  `record_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`record_id`) USING BTREE,
  KEY `index_2` (`sentence_id`)
) ENGINE=MyISAM AUTO_INCREMENT=26712284 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sentence_oae`
--

DROP TABLE IF EXISTS `sentence_oae`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sentence_oae` (
  `sentid` int(11) NOT NULL,
  `pmid` int(11) DEFAULT NULL,
  `term_type` varchar(45) DEFAULT NULL,
  `term_id` varchar(45) NOT NULL,
  `matching_term` varchar(255) DEFAULT NULL,
  `flanking_text` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`sentid`,`term_id`),
  KEY `index_term_id` (`term_id`),
  KEY `index_pmid` (`pmid`),
  KEY `index_sentid` (`sentid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sentence_vaccine`
--

DROP TABLE IF EXISTS `sentence_vaccine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sentence_vaccine` (
  `sentid` int(11) NOT NULL,
  `pmid` int(11) DEFAULT NULL,
  `term_type` varchar(45) DEFAULT NULL,
  `term_id` varchar(45) NOT NULL,
  `matching_term` varchar(255) DEFAULT NULL,
  `flanking_text` varchar(1024) DEFAULT NULL,
  KEY `index_2` (`sentid`)
) ENGINE=MyISAM AUTO_INCREMENT=25850640 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sentences24_Host`
--

DROP TABLE IF EXISTS `sentences24_Host`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sentences24_Host` (
  `sentenceID` int(11) NOT NULL,
  `PMID` int(11) NOT NULL,
  `sentence` varchar(4096) DEFAULT NULL,
  PRIMARY KEY (`sentenceID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sentences25_genepair_2024`
--

DROP TABLE IF EXISTS `sentences25_genepair_2024`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sentences25_genepair_2024` (
  `sentenceID` int(11) NOT NULL,
  `PMID` int(11) NOT NULL,
  `sentence` varchar(4096) DEFAULT NULL,
  PRIMARY KEY (`sentenceID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_combined_casp2`
--

DROP TABLE IF EXISTS `t_centrality_score_combined_casp2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_combined_casp2` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_combined_fever`
--

DROP TABLE IF EXISTS `t_centrality_score_combined_fever`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_combined_fever` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_combined_fever_vaccine`
--

DROP TABLE IF EXISTS `t_centrality_score_combined_fever_vaccine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_combined_fever_vaccine` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_combined_whole`
--

DROP TABLE IF EXISTS `t_centrality_score_combined_whole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_combined_whole` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_dignet`
--

DROP TABLE IF EXISTS `t_centrality_score_dignet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_dignet` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  `c_query_id` varchar(16) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`,`c_query_id`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_dignet_backup`
--

DROP TABLE IF EXISTS `t_centrality_score_dignet_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_dignet_backup` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  `c_query_id` varchar(16) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`,`c_query_id`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_gene2gene_casp2`
--

DROP TABLE IF EXISTS `t_centrality_score_gene2gene_casp2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_gene2gene_casp2` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_gene2gene_fever`
--

DROP TABLE IF EXISTS `t_centrality_score_gene2gene_fever`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_gene2gene_fever` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_gene2gene_vaccine`
--

DROP TABLE IF EXISTS `t_centrality_score_gene2gene_vaccine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_gene2gene_vaccine` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_gene2gene_vo`
--

DROP TABLE IF EXISTS `t_centrality_score_gene2gene_vo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_gene2gene_vo` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_gene2gene_whole`
--

DROP TABLE IF EXISTS `t_centrality_score_gene2gene_whole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_gene2gene_whole` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_centrality_score_gene2vaccine_fever`
--

DROP TABLE IF EXISTS `t_centrality_score_gene2vaccine_fever`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_centrality_score_gene2vaccine_fever` (
  `genesymbol` varchar(20) NOT NULL,
  `score` double NOT NULL,
  `score_type` varchar(1) NOT NULL,
  PRIMARY KEY (`genesymbol`,`score_type`),
  KEY `index_genesymbol` (`genesymbol`),
  KEY `index_score_type` (`score_type`),
  KEY `index_score` (`score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_drug`
--

DROP TABLE IF EXISTS `t_drug`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_drug` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pmid` int(11) NOT NULL,
  `drugbank_id` varchar(255) DEFAULT NULL,
  `drug_term` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pmid` (`pmid`)
) ENGINE=InnoDB AUTO_INCREMENT=7077781 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_gene_info`
--

DROP TABLE IF EXISTS `t_gene_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_gene_info` (
  `tax_id` int(10) unsigned NOT NULL,
  `GeneID` int(10) unsigned NOT NULL,
  `Symbol` varchar(40) NOT NULL,
  `LocusTag` varchar(40) NOT NULL,
  `Synonyms` varchar(256) NOT NULL,
  `dbXrefs` varchar(256) NOT NULL,
  `chromosome` varchar(10) NOT NULL,
  `map_location` varchar(45) NOT NULL,
  `description` varchar(256) NOT NULL,
  `type_of_gene` varchar(45) NOT NULL,
  `Symbol_from_nomenclature_authority` varchar(45) NOT NULL,
  `Full_name_from_nomenclature_authority` varchar(256) NOT NULL,
  `Nomenclature_status` varchar(45) NOT NULL,
  `Other_designations` varchar(1024) NOT NULL,
  `Modification_date` varchar(12) NOT NULL,
  PRIMARY KEY (`GeneID`),
  KEY `idx_gene_info_symbol` (`Symbol`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_gene_list`
--

DROP TABLE IF EXISTS `t_gene_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_gene_list` (
  `c_genesymbol` varchar(45) NOT NULL,
  `c_score` varchar(1) DEFAULT 'n',
  `c_hasvaccine` tinyint(4) DEFAULT 0,
  `c_hugo_id` varchar(10) DEFAULT NULL,
  `c_gene_product` varchar(256) DEFAULT NULL,
  `c_synonyms` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`c_genesymbol`),
  KEY `index_score` (`c_score`),
  KEY `index_hasvaccine` (`c_hasvaccine`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_gene_pairs`
--

DROP TABLE IF EXISTS `t_gene_pairs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_gene_pairs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pmid` int(10) unsigned DEFAULT NULL,
  `sentence_id` int(10) unsigned DEFAULT NULL,
  `gene_match1` varchar(128) DEFAULT NULL,
  `gene_match2` varchar(128) DEFAULT NULL,
  `gene_symbol1` varchar(45) DEFAULT NULL,
  `gene_symbol2` varchar(45) DEFAULT NULL,
  `score` double DEFAULT NULL,
  `has_vaccine` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pmid` (`pmid`),
  KEY `idx_geneSymbol1` (`gene_symbol1`),
  KEY `idx_geneSymbol2` (`gene_symbol2`),
  KEY `idx_gene_pair_1` (`pmid`,`gene_symbol1`,`gene_symbol2`),
  KEY `idx_score` (`score`)
) ENGINE=InnoDB AUTO_INCREMENT=5177266 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_hdo`
--

DROP TABLE IF EXISTS `t_hdo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_hdo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pmid` int(11) NOT NULL,
  `hdo_id` varchar(255) DEFAULT NULL,
  `hdo_term` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pmid` (`pmid`)
) ENGINE=InnoDB AUTO_INCREMENT=18874081 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_ino`
--

DROP TABLE IF EXISTS `t_ino`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_ino` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sentence_id` int(11) DEFAULT NULL,
  `pmid` int(11) DEFAULT NULL,
  `ino_id` varchar(45) DEFAULT NULL,
  `matching_phrase` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pmid_matchterm` (`pmid`,`matching_phrase`),
  KEY `idx_ino_sentence_id` (`sentence_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42597751 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_pmid_year`
--

DROP TABLE IF EXISTS `t_pmid_year`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pmid_year` (
  `PMID` int(11) NOT NULL,
  `pub_year` smallint(6) NOT NULL,
  PRIMARY KEY (`PMID`),
  KEY `idx_year` (`pub_year`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_pubmed`
--

DROP TABLE IF EXISTS `t_pubmed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pubmed` (
  `c_pmid` varchar(25) NOT NULL DEFAULT '',
  `c_reference_name` varchar(255) DEFAULT NULL,
  `c_reference_type` varchar(10) DEFAULT NULL,
  `c_authors` varchar(1024) DEFAULT NULL,
  `c_title` text DEFAULT NULL,
  `c_year` varchar(25) DEFAULT NULL,
  `c_volume` varchar(25) DEFAULT NULL,
  `c_issue` varchar(25) DEFAULT NULL,
  `c_pages` varchar(25) DEFAULT NULL,
  `c_journal_book_name` varchar(255) DEFAULT NULL,
  `c_publisher` varchar(255) DEFAULT NULL,
  `c_publisher_location` varchar(255) DEFAULT NULL,
  `c_book_editors` varchar(255) DEFAULT NULL,
  `c_isbn` varchar(255) DEFAULT NULL,
  `c_university` varchar(255) DEFAULT NULL,
  `c_university_location` varchar(255) DEFAULT NULL,
  `c_degree` varchar(25) DEFAULT NULL,
  `c_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`c_pmid`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_pubmed_query`
--

DROP TABLE IF EXISTS `t_pubmed_query`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pubmed_query` (
  `c_query_text` varchar(256) NOT NULL,
  `c_query_id` varchar(45) DEFAULT NULL,
  `c_project_id` varchar(45) DEFAULT NULL,
  `c_num_genes` int(11) DEFAULT NULL,
  `c_num_pairs` int(11) DEFAULT NULL,
  `c_num_pubmed_records` int(11) DEFAULT NULL,
  `c_pubmed_records` mediumtext DEFAULT NULL,
  `c_query_int_id` int(11) NOT NULL AUTO_INCREMENT,
  `c_query_ts` datetime DEFAULT NULL,
  PRIMARY KEY (`c_query_int_id`),
  KEY `index_query_id` (`c_query_id`),
  KEY `index_project_id` (`c_project_id`),
  KEY `idx_query_ts` (`c_query_ts`)
) ENGINE=MyISAM AUTO_INCREMENT=87 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_pubmed_query_bak`
--

DROP TABLE IF EXISTS `t_pubmed_query_bak`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pubmed_query_bak` (
  `c_query_text` varchar(256) NOT NULL,
  `c_pubmed_records` mediumtext DEFAULT NULL,
  PRIMARY KEY (`c_query_text`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_pubmed_query_bak_250514`
--

DROP TABLE IF EXISTS `t_pubmed_query_bak_250514`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pubmed_query_bak_250514` (
  `c_query_text` varchar(256) NOT NULL,
  `c_query_id` varchar(45) DEFAULT NULL,
  `c_project_id` varchar(45) DEFAULT NULL,
  `c_num_genes` int(11) DEFAULT NULL,
  `c_num_pairs` int(11) DEFAULT NULL,
  `c_num_pubmed_records` int(11) DEFAULT NULL,
  `c_pubmed_records` mediumtext DEFAULT NULL,
  `c_query_int_id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`c_query_int_id`),
  KEY `index_query_id` (`c_query_id`),
  KEY `index_project_id` (`c_project_id`)
) ENGINE=MyISAM AUTO_INCREMENT=1005 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_pubmed_query_history`
--

DROP TABLE IF EXISTS `t_pubmed_query_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_pubmed_query_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `c_query_text` varchar(256) NOT NULL,
  `c_num_pubmed_records` int(11) NOT NULL,
  `c_query_ts` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`history_id`),
  KEY `idx_query_text` (`c_query_text`(50)),
  KEY `idx_query_ts` (`c_query_ts`)
) ENGINE=InnoDB AUTO_INCREMENT=750 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentence_hit_gene2gene`
--

DROP TABLE IF EXISTS `t_sentence_hit_gene2gene`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentence_hit_gene2gene` (
  `PMID` int(10) unsigned NOT NULL,
  `sentenceID` int(10) unsigned NOT NULL,
  `geneSymbol1` varchar(45) NOT NULL,
  `geneSymbol2` varchar(45) NOT NULL,
  `geneMatch1` varchar(128) NOT NULL,
  `geneMatch2` varchar(128) NOT NULL,
  `score` double NOT NULL,
  `hasVaccine` tinyint(1) NOT NULL,
  `keywords` varchar(45) NOT NULL,
  `sentence` varchar(4096) NOT NULL,
  `in_ifng_network` tinyint(1) NOT NULL DEFAULT 0,
  `c_hit_id` int(10) unsigned NOT NULL,
  `hasFever` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `in_casp2_network` tinyint(1) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`sentenceID`,`geneSymbol1`,`geneSymbol2`),
  KEY `index_genSymbol1` (`geneSymbol1`) USING BTREE,
  KEY `index_geneSymbol2` (`geneSymbol2`) USING BTREE,
  KEY `index_geneMatch1` (`geneMatch1`) USING BTREE,
  KEY `index_geneMatch2` (`geneMatch2`) USING BTREE,
  KEY `index_score` (`score`) USING BTREE,
  KEY `index_has_vaccine` (`hasVaccine`) USING BTREE,
  KEY `index_pmid` (`PMID`),
  KEY `index_sentenceid` (`sentenceID`),
  KEY `index_hasfever` (`hasFever`),
  KEY `index_in_ifng_network` (`in_ifng_network`),
  KEY `index_id` (`c_hit_id`),
  FULLTEXT KEY `index_fulltext` (`sentence`)
) ENGINE=MyISAM AUTO_INCREMENT=1758179 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentence_hit_gene2gene_Host_2024`
--

DROP TABLE IF EXISTS `t_sentence_hit_gene2gene_Host_2024`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentence_hit_gene2gene_Host_2024` (
  `gene2gene_host_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `PMID` int(10) DEFAULT NULL,
  `sentenceID` int(10) DEFAULT NULL,
  `geneMatch1` varchar(128) DEFAULT NULL,
  `geneMatch2` varchar(128) DEFAULT NULL,
  `geneSymbol1` varchar(45) DEFAULT NULL,
  `geneSymbol2` varchar(45) DEFAULT NULL,
  `score` double DEFAULT NULL,
  `hasVaccine` tinyint(1) DEFAULT NULL,
  `keywords` varchar(45) DEFAULT NULL,
  `in_ifng_network` tinyint(1) DEFAULT 0,
  `c_hit_id` int(10) DEFAULT NULL,
  `hasFever` tinyint(3) DEFAULT 0,
  `in_casp2_network` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`gene2gene_host_id`),
  KEY `idx_genesymbols` (`geneSymbol1`,`geneSymbol2`),
  KEY `idx_pmid_t_gene2gene` (`PMID`),
  KEY `idx_t_gene2gene_genes` (`geneSymbol1`,`geneSymbol2`),
  KEY `idx_genes` (`geneSymbol1`,`geneSymbol2`),
  KEY `idx_pmid` (`PMID`),
  KEY `idx_gene_pair_2` (`PMID`,`geneSymbol1`,`geneSymbol2`),
  KEY `idx_gene_pair2` (`PMID`,`geneSymbol1`,`geneSymbol2`),
  KEY `idx_pmid_gene1_gene2_2024` (`PMID`,`geneSymbol1`,`geneSymbol2`),
  KEY `idx_geneSymbol1_2024` (`geneSymbol1`),
  KEY `idx_geneSymbol2_2024` (`geneSymbol2`)
) ENGINE=InnoDB AUTO_INCREMENT=4325312 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentence_hit_gene2gene_INO`
--

DROP TABLE IF EXISTS `t_sentence_hit_gene2gene_INO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentence_hit_gene2gene_INO` (
  `gene2gene_ino_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `PMID` int(10) DEFAULT NULL,
  `sentenceID` int(10) DEFAULT NULL,
  `geneMatch1` varchar(128) DEFAULT NULL,
  `geneMatch2` varchar(128) DEFAULT NULL,
  `geneSymbol1` varchar(128) DEFAULT NULL,
  `geneSymbol2` varchar(128) DEFAULT NULL,
  `score` double DEFAULT NULL,
  `hasVaccine` tinyint(1) DEFAULT NULL,
  `keywords` varchar(45) DEFAULT NULL,
  `sentence` varchar(4096) DEFAULT NULL,
  `in_ifng_network` tinyint(1) DEFAULT 0,
  `c_hit_id` int(10) DEFAULT NULL,
  `hasFever` tinyint(3) DEFAULT 0,
  `in_casp2_network` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`gene2gene_ino_id`)
) ENGINE=InnoDB AUTO_INCREMENT=66022354 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentence_hit_gene2gene_XO_Brucella`
--

DROP TABLE IF EXISTS `t_sentence_hit_gene2gene_XO_Brucella`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentence_hit_gene2gene_XO_Brucella` (
  `gene2gene_xo_brucella_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `PMID` int(10) DEFAULT NULL,
  `sentenceID` int(10) DEFAULT NULL,
  `geneMatch1` varchar(128) DEFAULT NULL,
  `geneMatch2` varchar(128) DEFAULT NULL,
  `geneSymbol1` varchar(45) DEFAULT NULL,
  `geneSymbol2` varchar(45) DEFAULT NULL,
  `score` double DEFAULT NULL,
  `hasVaccine` tinyint(1) DEFAULT NULL,
  `keywords` varchar(45) DEFAULT NULL,
  `sentence` varchar(4096) DEFAULT NULL,
  `in_ifng_network` tinyint(1) DEFAULT 0,
  `c_hit_id` int(10) DEFAULT NULL,
  `hasFever` tinyint(3) DEFAULT 0,
  `in_casp2_network` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`gene2gene_xo_brucella_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1024 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentence_hit_gene2gene_bak`
--

DROP TABLE IF EXISTS `t_sentence_hit_gene2gene_bak`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentence_hit_gene2gene_bak` (
  `PMID` int(10) unsigned NOT NULL,
  `sentenceID` int(10) unsigned NOT NULL,
  `geneSymbol1` varchar(45) NOT NULL,
  `geneSymbol2` varchar(45) NOT NULL,
  `geneMatch1` varchar(128) NOT NULL,
  `geneMatch2` varchar(128) NOT NULL,
  `score` double NOT NULL,
  `hasVaccine` tinyint(1) NOT NULL,
  `keywords` varchar(45) NOT NULL,
  `sentence` varchar(4096) NOT NULL,
  `in_ifng_network` tinyint(1) NOT NULL DEFAULT 0,
  `c_hit_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `hasFever` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `in_casp2_network` tinyint(1) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`c_hit_id`) USING BTREE,
  KEY `index_genSymbol1` (`geneSymbol1`) USING BTREE,
  KEY `index_geneSymbol2` (`geneSymbol2`) USING BTREE,
  KEY `index_geneMatch1` (`geneMatch1`) USING BTREE,
  KEY `index_geneMatch2` (`geneMatch2`) USING BTREE,
  KEY `index_score` (`score`) USING BTREE,
  KEY `index_has_vaccine` (`hasVaccine`) USING BTREE,
  KEY `index_pmid` (`PMID`),
  KEY `index_sentenceid` (`sentenceID`),
  KEY `index_hasfever` (`hasFever`),
  KEY `index_in_ifng_network` (`in_ifng_network`)
) ENGINE=MyISAM AUTO_INCREMENT=756174 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentence_hit_gene2gene_casp2`
--

DROP TABLE IF EXISTS `t_sentence_hit_gene2gene_casp2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentence_hit_gene2gene_casp2` (
  `PMID` int(10) unsigned NOT NULL,
  `sentenceID` int(10) unsigned NOT NULL,
  `geneSymbol1` varchar(45) NOT NULL,
  `geneSymbol2` varchar(45) NOT NULL,
  `geneMatch1` varchar(128) NOT NULL,
  `geneMatch2` varchar(128) NOT NULL,
  `score` double NOT NULL,
  `hasVaccine` tinyint(1) NOT NULL,
  `keywords` varchar(45) NOT NULL,
  `sentence` varchar(4096) NOT NULL,
  `in_ifng_network` tinyint(1) NOT NULL DEFAULT 0,
  `c_hit_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `hasFever` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `in_casp2_network` tinyint(1) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`c_hit_id`) USING BTREE,
  KEY `index_genSymbol1` (`geneSymbol1`) USING BTREE,
  KEY `index_geneSymbol2` (`geneSymbol2`) USING BTREE,
  KEY `index_geneMatch1` (`geneMatch1`) USING BTREE,
  KEY `index_geneMatch2` (`geneMatch2`) USING BTREE,
  KEY `index_score` (`score`) USING BTREE,
  KEY `index_has_vaccine` (`hasVaccine`) USING BTREE,
  KEY `index_pmid` (`PMID`),
  KEY `index_sentenceid` (`sentenceID`),
  KEY `index_hasfever` (`hasFever`),
  KEY `index_in_ifng_network` (`in_ifng_network`)
) ENGINE=MyISAM AUTO_INCREMENT=1758142 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentence_hit_gene2gene_fever`
--

DROP TABLE IF EXISTS `t_sentence_hit_gene2gene_fever`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentence_hit_gene2gene_fever` (
  `PMID` int(10) unsigned NOT NULL,
  `sentenceID` int(10) unsigned NOT NULL,
  `geneSymbol1` varchar(45) NOT NULL,
  `geneSymbol2` varchar(45) NOT NULL,
  `geneMatch1` varchar(128) NOT NULL,
  `geneMatch2` varchar(128) NOT NULL,
  `score` double NOT NULL,
  `hasVaccine` tinyint(1) NOT NULL,
  `keywords` varchar(45) NOT NULL,
  `sentence` varchar(4096) NOT NULL,
  `in_ifng_network` tinyint(1) NOT NULL DEFAULT 0,
  `c_hit_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `hasFever` tinyint(3) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`c_hit_id`) USING BTREE,
  KEY `index_genSymbol1` (`geneSymbol1`) USING BTREE,
  KEY `index_geneSymbol2` (`geneSymbol2`) USING BTREE,
  KEY `index_geneMatch1` (`geneMatch1`) USING BTREE,
  KEY `index_geneMatch2` (`geneMatch2`) USING BTREE,
  KEY `index_score` (`score`) USING BTREE,
  KEY `index_has_vaccine` (`hasVaccine`) USING BTREE,
  KEY `index_pmid` (`PMID`),
  KEY `index_sentenceid` (`sentenceID`),
  KEY `index_hasfever` (`hasFever`),
  KEY `index_in_ifng_network` (`in_ifng_network`)
) ENGINE=MyISAM AUTO_INCREMENT=756174 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentence_hit_gene2gene_raw`
--

DROP TABLE IF EXISTS `t_sentence_hit_gene2gene_raw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentence_hit_gene2gene_raw` (
  `PMID` int(10) unsigned NOT NULL,
  `sentenceID` int(10) unsigned NOT NULL,
  `geneSymbol1` varchar(45) NOT NULL,
  `geneSymbol2` varchar(45) NOT NULL,
  `geneMatch1` varchar(128) NOT NULL,
  `geneMatch2` varchar(128) NOT NULL,
  `score` double NOT NULL,
  `hasVaccine` tinyint(1) NOT NULL,
  `keywords` varchar(45) NOT NULL,
  `sentence` varchar(4096) NOT NULL,
  `in_ifng_network` tinyint(1) NOT NULL DEFAULT 0,
  `c_hit_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `hasFever` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `in_casp2_network` tinyint(1) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`c_hit_id`) USING BTREE,
  KEY `index_genSymbol1` (`geneSymbol1`) USING BTREE,
  KEY `index_geneSymbol2` (`geneSymbol2`) USING BTREE,
  KEY `index_geneMatch1` (`geneMatch1`) USING BTREE,
  KEY `index_geneMatch2` (`geneMatch2`) USING BTREE,
  KEY `index_score` (`score`) USING BTREE,
  KEY `index_has_vaccine` (`hasVaccine`) USING BTREE,
  KEY `index_pmid` (`PMID`),
  KEY `index_sentenceid` (`sentenceID`),
  KEY `index_hasfever` (`hasFever`),
  KEY `index_in_ifng_network` (`in_ifng_network`)
) ENGINE=MyISAM AUTO_INCREMENT=1758179 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentence_hit_gene2vaccine`
--

DROP TABLE IF EXISTS `t_sentence_hit_gene2vaccine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentence_hit_gene2vaccine` (
  `pmid` int(10) unsigned NOT NULL,
  `sentence_id` int(10) unsigned NOT NULL,
  `gene_symbol1` varchar(45) NOT NULL,
  `gene_symbol2` varchar(45) NOT NULL,
  `gene_match1` varchar(128) NOT NULL,
  `gene_match2` varchar(128) NOT NULL,
  `score` double NOT NULL,
  `has_vaccine` tinyint(1) NOT NULL,
  `sentence` varchar(4096) NOT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `geneID1` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `index_genSymbol1` (`gene_symbol1`) USING BTREE,
  KEY `index_geneSymbol2` (`gene_symbol2`) USING BTREE,
  KEY `index_geneMatch1` (`gene_match1`) USING BTREE,
  KEY `index_geneMatch2` (`gene_match2`) USING BTREE,
  KEY `index_score` (`score`) USING BTREE,
  KEY `index_has_vaccine` (`has_vaccine`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=10292 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentences`
--

DROP TABLE IF EXISTS `t_sentences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentences` (
  `sentence_id` int(11) NOT NULL,
  `pmid` int(11) NOT NULL,
  `sentence` varchar(4096) DEFAULT NULL,
  PRIMARY KEY (`sentence_id`),
  KEY `idx_pmid` (`pmid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_sentences_host_legacy`
--

DROP TABLE IF EXISTS `t_sentences_host_legacy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_sentences_host_legacy` (
  `sentenceID` int(11) NOT NULL,
  `PMID` int(11) NOT NULL,
  `sentence` varchar(4096) DEFAULT NULL,
  PRIMARY KEY (`sentenceID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_vo`
--

DROP TABLE IF EXISTS `t_vo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_vo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sentence_id` int(11) DEFAULT NULL,
  `pmid` int(11) DEFAULT NULL,
  `vo_id` varchar(45) DEFAULT NULL,
  `matching_phrase` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pmid` (`pmid`),
  KEY `idx_sentence_id` (`sentence_id`)
) ENGINE=InnoDB AUTO_INCREMENT=720886 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_vo_has_gene_data`
--

DROP TABLE IF EXISTS `t_vo_has_gene_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_vo_has_gene_data` (
  `vo_id` varchar(20) NOT NULL,
  PRIMARY KEY (`vo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_vo_hierarchy`
--

DROP TABLE IF EXISTS `t_vo_hierarchy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_vo_hierarchy` (
  `vo_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `level` int(11) NOT NULL,
  `parent_vo_id` varchar(20) DEFAULT NULL,
  `children` text DEFAULT NULL,
  PRIMARY KEY (`vo_id`),
  KEY `idx_parent` (`parent_vo_id`),
  KEY `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usage_events`
--

DROP TABLE IF EXISTS `usage_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usage_events` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `event_type` varchar(50) NOT NULL,
  `endpoint` varchar(200) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_created` (`created_at`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=867 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vo_sciminer_187_terms`
--

DROP TABLE IF EXISTS `vo_sciminer_187_terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vo_sciminer_187_terms` (
  `sentenceID` int(10) NOT NULL,
  `PMID` int(10) NOT NULL,
  `voID` varchar(15) NOT NULL,
  `mentionedTerm` varchar(100) NOT NULL,
  `recordID` int(15) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`recordID`),
  KEY `sentenceID` (`sentenceID`) USING BTREE,
  KEY `PMID` (`PMID`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=523677 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `xobrucella_details`
--

DROP TABLE IF EXISTS `xobrucella_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `xobrucella_details` (
  `sentence_id` int(11) DEFAULT NULL,
  `pmid` int(11) DEFAULT NULL,
  `id` varchar(45) DEFAULT NULL,
  `matching_phrase` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-30 12:47:26
