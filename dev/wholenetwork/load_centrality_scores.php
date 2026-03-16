<?php 
chdir(dirname(__FILE__));
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$work_dir="/data/var/projects/ignet/whole_network";

/************************************************/
// vaccine (VO_0000001) related gene-gene

$pairs=array();

$strSql="SELECT distinct geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where score>0 ";

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
	$voids[$row['mentionedterm']]= $row['void'];
}

$voids['vaccinations']='VO_0000001';
$voids['Vaccination']='VO_0000001';

$strSql="SELECT distinct geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2vaccine where score>0";

$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$geneSymbol1=$row['geneSymbol1'];
	$geneSymbol2=$row['geneSymbol2'];
	
	if (isset($voids[$geneSymbol1])) $geneSymbol1=$voids[$geneSymbol1];
	if (isset($voids[$geneSymbol2])) $geneSymbol2=$voids[$geneSymbol2];
	
	$pairs[$geneSymbol1. "\t" .$geneSymbol2]=1;
}

foreach ($rs as $row) {
	$geneSymbol1=$row['geneSymbol1'];
	$geneSymbol2=$row['geneSymbol2'];

	if (isset($voids[$geneSymbol1])) $geneSymbol1=$voids[$geneSymbol1];
	if (isset($voids[$geneSymbol2])) $geneSymbol2=$voids[$geneSymbol2];

	if(isset($pairs[$geneSymbol1. "\t" .$geneSymbol2])) {
		unset($pairs[$geneSymbol2. "\t" .$geneSymbol1]);
	}
}


chdir($work_dir);

//file_put_contents("$work_dir/whole_network.graph", join("\n", array_keys($pairs)));


//system("../code/clairlib-core-1.08/util/print_network_stats.pl --delim '\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i whole_network.graph");

//system("../code/run_pagerank.pl whole_network.graph > whole_network.pagerank-centrality");

$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);
$db->Execute("TRUNCATE TABLE t_centrality_score_combined_whole");
$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/whole_network.betweenness-centrality' INTO TABLE t_centrality_score_combined_whole COLUMNS TERMINATED BY ' ' SET score_type='b'");
$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/whole_network.closeness-centrality' INTO TABLE t_centrality_score_combined_whole COLUMNS TERMINATED BY ' ' SET score_type='c'");
$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/whole_network.degree-centrality' INTO TABLE t_centrality_score_combined_whole COLUMNS TERMINATED BY ' ' SET score_type='d'");
$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/whole_network.pagerank-centrality' INTO TABLE t_centrality_score_combined_whole SET score_type='p'");



$pairs=array();

$strSql="SELECT distinct geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where score>0 ";

$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]=1;
}

foreach ($rs as $row) {
	if(isset($pairs[$row['geneSymbol2']. "\t" .$row['geneSymbol1']])) {
		unset($pairs[$row['geneSymbol1']. "\t" .$row['geneSymbol2']]);
	}
}



chdir($work_dir);

//file_put_contents("$work_dir/whole_network.graph", join("\n", array_keys($pairs)));


//system("../code/clairlib-core-1.08/util/print_network_stats.pl --delim '\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i whole_network.graph");

//system("../code/run_pagerank.pl whole_network.graph > whole_network.pagerank-centrality");

$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);
$db->Execute("TRUNCATE TABLE t_centrality_score_gene2gene_whole");
$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/whole_network.betweenness-centrality' INTO TABLE t_centrality_score_gene2gene_whole COLUMNS TERMINATED BY ' ' SET score_type='b'");
$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/whole_network.closeness-centrality' INTO TABLE t_centrality_score_gene2gene_whole COLUMNS TERMINATED BY ' ' SET score_type='c'");
$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/whole_network.degree-centrality' INTO TABLE t_centrality_score_gene2gene_whole COLUMNS TERMINATED BY ' ' SET score_type='d'");
$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/whole_network.pagerank-centrality' INTO TABLE t_centrality_score_gene2gene_whole SET score_type='p'");



?>
Done!
