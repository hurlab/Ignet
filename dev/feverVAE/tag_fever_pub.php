<?php 
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$pubmed_ids=array();
$lines=file('fever_pubmed_result.txt');
foreach($lines as $line) {
	$pubmed_ids[trim($line)]=1;
}

$strSql="SELECT distinct pmid FROM t_sentence_hit_gene2gene";
$rs=$db->Execute($strSql);
foreach($rs as $row) {
	if (isset($pubmed_ids[$row['pmid']])) {
		$strSql="UPDATE t_sentence_hit_genes SET hasFever=1 WHERE pmid=".$row['pmid'];
		$db->Execute($strSql);
	}
}

$strSql="SELECT distinct pmid FROM t_sentence_hit_gene2vaccine";
$rs=$db->Execute($strSql);
foreach($rs as $row) {
	if (isset($pubmed_ids[$row['pmid']])) {
		$strSql="UPDATE t_sentence_hit_gene_vaccine SET hasFever=1 WHERE pmid=".$row['pmid'];
		$db->Execute($strSql);
	}
}


?>
Done!
