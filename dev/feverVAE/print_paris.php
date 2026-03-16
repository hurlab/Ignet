<?php 
chdir(dirname(__FILE__));

include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);
$pairs=array();



$strSql="SELECT distinct geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where hasfever=1 and score>0 and hasVaccine=1;";

$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]=1;
}

foreach ($rs as $row) {
	if(isset($pairs[$row['geneSymbol2']. "\t" .$row['geneSymbol1']])) {
		unset($pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]);
	}
}




$strSql="SELECT distinct void, mentionedterm FROM vo_sciminer_187_terms";
$voids=array();
$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$voids[$row['mentionedterm']]= $row['void']];
}



$strSql="SELECT distinct geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2vaccine where hasfever=1 and score>0 and hasVaccine=1;";


$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$geneSymbol1=$row['geneSymbol1'];
	$geneSymbol2=$row['geneSymbol2'];
	
	if (isset($voids[$geneSymbol1])) $geneSymbol1=$voids[$geneSymbol1];
	if (isset($voids[$geneSymbol2])) $geneSymbol1=$voids[$geneSymbol2];
	
	$pairs[$geneSymbol1. "\t" .$geneSymbol2]=1;
}

foreach ($rs as $row) {
	$geneSymbol1=$row['geneSymbol1'];
	$geneSymbol2=$row['geneSymbol2'];

	if (isset($voids[$geneSymbol1])) $geneSymbol1=$voids[$geneSymbol1];
	if (isset($voids[$geneSymbol2])) $geneSymbol1=$voids[$geneSymbol2];

	if(isset($pairs[$geneSymbol1. "\t" .$geneSymbol2])) {
		unset($pairs[$geneSymbol2. "\t" .$geneSymbol1]);
	}
}

print(join("\n", array_keys($pairs)));

//next step
//  /data/var/local/clairlib-core-1.08/util/print_network_stats.pl --delim '\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i ifng-network.graph

//  /data/var/projects/ignet/code/run_pagerank.pl ifng-network.graph >  fever_vae_network.pagerank-centrality


?>
