<?php 
chdir(dirname(__FILE__));

include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);


$pairs=array();

$strSql="SELECT distinct geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where score>0 and pmid in (select distinct pmid from vo_sciminer_187_terms where void='VO_0000001')";
//$strSql="SELECT distinct geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where score>0 and hasvaccine=1";

$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]=1;
}

foreach ($rs as $row) {
	if(isset($pairs[$row['geneSymbol2']. "\t" .$row['geneSymbol1']])) {
		unset($pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]);
	}
}


/*

$strSql="SELECT distinct geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2vaccine where hasfever=1 and score>0 and hasVaccine=1;";

$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]=1;
}

foreach ($rs as $row) {
	if(isset($pairs[$row['geneSymbol2']. "\t" .$row['geneSymbol1']])) {
		unset($pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]);
	}
}


*/

print(join("\n", array_keys($pairs)));

//next step
//  ../code/clairlib-core-1.08/util/print_network_stats.pl --delim '\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i fever_vae_network.graph

//  ../code/run_pagerank.pl fever_vae_network.graph >  fever_vae_network.pagerank-centrality


?>
