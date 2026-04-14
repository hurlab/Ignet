<?php
//load pmids into table t_pubmed_query
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);


foreach(glob('pmidfiles/*.lst') as $filePath){
	$c_query_id = createRandomPassword();
	$c_query_text = str_replace('.lst', '', str_replace('pmidfiles/', '', $filePath));
	
	$strPMIDs = file_get_contents($filePath);
	$strPMIDs = preg_replace('/[\r\n]+/', ',',trim($strPMIDs));
	
	$strSql = "REPLACE INTO `ignet`.`t_pubmed_query` (c_query_text, c_pubmed_records, c_query_id, c_project_id)
VALUES
('$c_query_text', '$strPMIDs', '$c_query_id', 'Cardiotoxicity');
";
	$db->Execute($strSql);
}
?>