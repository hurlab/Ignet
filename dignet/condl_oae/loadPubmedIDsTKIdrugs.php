<?php
//load TKI drugs related pmids into table t_pubmed_query
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$tki_ids=array();

$tki_ids['JHD_0000001'] = 'dasatinib';
$tki_ids['JHD_0000002'] = 'imatinib';
$tki_ids['JHD_0000003'] = 'cetuximab';
$tki_ids['JHD_0000004'] = 'lapatinib';
$tki_ids['JHD_0000005'] = 'trastuzumab';



$tki_pmids=array();
$strSql = "SELECT distinct pmid, term_id FROM ignet.sentence_oae where term_id like 'JHD_%';";
$rs = $db->Execute($strSql);
foreach($rs as $row) {
	$tki_pmids[$row['term_id']][] = $row['pmid'];
}


$lines = file("oae_ids.txt", FILE_IGNORE_NEW_LINES);

foreach($tki_pmids as $term_id => $pmids){

	$c_query_id = createRandomPassword();

	$strPMIDs = join(",", array_keys($pmids));
	
	$strSql = "REPLACE INTO `ignet`.`t_pubmed_query` (c_query_text, c_pubmed_records, c_query_id, c_project_id)
VALUES
('drug {$tki_ids[$term_id]}', '$strPMIDs', '$c_query_id', 'Cardiotoxicity_oae');
";
	$db->Execute($strSql);
}
?>