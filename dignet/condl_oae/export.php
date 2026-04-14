<?php
//export results as text files.
 
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$strSql = "SELECT * FROM t_pubmed_query where c_project_id = 'Cardiotoxicity_oae'";
$rs = $db->Execute($strSql);


foreach ($rs as $row) {
	$pubmedRecords=$row['c_pubmed_records'];
	$keywords = $row['c_query_text'];
	$c_query_id = $row['c_query_id'];
	
	if ($pubmedRecords=='') {
		file_put_contents("exportFiles/$keywords.pairs", "");
		file_put_contents("exportFiles/$keywords.genes", "");
		file_put_contents("exportFiles/$keywords.p.scores", "");
		file_put_contents("exportFiles/$keywords.d.scores", "");
		file_put_contents("exportFiles/$keywords.b.scores", "");
		file_put_contents("exportFiles/$keywords.c.scores", "");
	}
	else {
		$strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where pmid in ($pubmedRecords)";
		
		$pairs=array();
		$arrayNode=array();
		
		$rsPair = $db->Execute($strSql);
		
		$node_id=0;
		
		foreach ($rsPair as $rowPair) {
			if (!isset($pairs[$rowPair['geneSymbol1']."\t".$rowPair['geneSymbol2']]) && !isset($pairs[$rowPair['geneSymbol2']."\t".$rowPair['geneSymbol1']])) $pairs[$rowPair['geneSymbol1']."\t".$rowPair['geneSymbol2']]=1;
	
			$node_id++;
			$arrayNode[$rowPair['geneSymbol1']]=$node_id;
			$node_id++;
			$arrayNode[$rowPair['geneSymbol2']]=$node_id;

		}
		file_put_contents("exportFiles/$keywords.pairs", join(PHP_EOL, array_keys($pairs)));
		file_put_contents("exportFiles/$keywords.genes", join(PHP_EOL, array_keys($arrayNode)));
		
		$strSql = "SELECT * from t_centrality_score_dignet where c_query_id='$c_query_id' order by score desc";
		$rsScore = $db->Execute($strSql);
		
		$arrayScore=array();
		foreach ($rsScore as $rowScore) {
			$arrayScore[$rowScore['score_type']][]=$rowScore['genesymbol']."\t".$rowScore['score'];
		}
		
		
		file_put_contents("exportFiles/$keywords.p.scores", join(PHP_EOL, isset($arrayScore['p']) ? $arrayScore['p'] : array()));
		file_put_contents("exportFiles/$keywords.d.scores", join(PHP_EOL, isset($arrayScore['d']) ? $arrayScore['d'] : array()));
		file_put_contents("exportFiles/$keywords.b.scores", join(PHP_EOL, isset($arrayScore['b']) ? $arrayScore['b'] : array()));
		file_put_contents("exportFiles/$keywords.c.scores", join(PHP_EOL, isset($arrayScore['c']) ? $arrayScore['c'] : array()));
	}
}

exec("tar zcf exportFiles".date("Y-m-d_H-i-s").".tgz exportFiles");
?>
