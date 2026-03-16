<?php 
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$strSql="SELECT distinct geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where in_ifng_network=1 and score>0;";

$pairs=array();
$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]=1;
}

foreach ($rs as $row) {
	if(isset($pairs[$row['geneSymbol2']. "\t" .$row['geneSymbol1']])) {
		unset($pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]);
	}
}


print(join("\n", array_keys($pairs)));

//next step
//  /data/var/local/clairlib-core-1.08/util/print_network_stats.pl --delim '\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i ifng-network.graph > ifng-network.pagerank-centrality
?>
