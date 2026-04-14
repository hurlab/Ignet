<?php 
//run centrality analyses for 

include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$strSql = "SELECT * FROM t_pubmed_query where c_project_id='Cardiotoxicity_oae'";
$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$pubmedRecords=$row['c_pubmed_records'];
	
	$c_query_id = $row['c_query_id'];
	
	if (trim($pubmedRecords)=='') {
		$strSql = "update t_pubmed_query set c_num_genes=0, c_num_pairs=0, c_num_pubmed_records=0 where  c_query_id=" . $db->qstr($c_query_id);
		$db->Execute($strSql);
	}
	else {
		$pubmedIds=preg_split('/,/', $pubmedRecords);
		$safePmids = implode(',', array_map('intval', $pubmedIds));

		$strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where pmid in ($safePmids)";

		$pairs=array();
		$genes=array();

		$rs = $db->Execute($strSql);
		foreach ($rs as $row) {
			if (!isset($pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]) && !isset($pairs[$row['geneSymbol2']."\t".$row['geneSymbol1']])) $pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]=1;
			$genes[$row['geneSymbol1']]=1;
			$genes[$row['geneSymbol2']]=1;
		}

		$strSql = "update t_pubmed_query set c_num_genes=".(int)sizeof($genes).", c_num_pairs=".(int)sizeof($pairs).", c_num_pubmed_records=".(int)sizeof($pubmedIds)." where  c_query_id=" . $db->qstr($c_query_id);
		$db->Execute($strSql);
	}
}
?>
