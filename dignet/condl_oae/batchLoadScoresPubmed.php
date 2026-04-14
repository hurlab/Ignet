<?php 
//run centrality analyses for 

include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$strSql = "SELECT * FROM t_pubmed_query where c_pubmed_records!='' and c_project_id='Cardiotoxicity_oae'";
$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$pubmedRecords=$row['c_pubmed_records'];
	$userfolder = $row['c_query_id'];
	
	$strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where pmid in ($pubmedRecords)";
	
	$pairs=array();
	
	$rs = $db->Execute($strSql);
	foreach ($rs as $row) {
		if (!isset($pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]) && !isset($pairs[$row['geneSymbol2']."\t".$row['geneSymbol1']])) $pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]=1;
	}
	
	$work_dir=dirname(dirname(__FILE__))."/userfiles/$userfolder";
	mkdir($work_dir);

	
	chdir($work_dir);
	
	file_put_contents("$work_dir/network.graph", join("\n", array_keys($pairs)));
	
	//print($work_dir);
	print("/data/var/projects/ignet/code/clairlib-core-1.08/util/print_network_stats.pl --delim '\\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i network.graph".PHP_EOL);
	
	exec("perl /data/var/projects/ignet/code/clairlib-core-1.08/util/print_network_stats.pl --delim '\\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i network.graph");
//	exec("perl /data/var/projects/ignet/code/clairlib-core-1.08/util/print_network_stats.pl --delim '\\t' --undirected --force --degree-centrality -i network.graph");
	
	exec("perl /data/var/projects/ignet/code/run_pagerank.pl network.graph > network.pagerank-centrality");
	
	$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/network.betweenness-centrality' INTO TABLE t_centrality_score_dignet COLUMNS TERMINATED BY ' ' SET score_type='b', c_query_id='$userfolder'");
	$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/network.closeness-centrality' INTO TABLE t_centrality_score_dignet COLUMNS TERMINATED BY ' ' SET score_type='c', c_query_id='$userfolder'");
	$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/network.degree-centrality' INTO TABLE t_centrality_score_dignet COLUMNS TERMINATED BY ' ' SET score_type='d', c_query_id='$userfolder'");
	$db->Execute("LOAD DATA LOCAL INFILE '$work_dir/network.pagerank-centrality' INTO TABLE t_centrality_score_dignet SET score_type='p', c_query_id='$userfolder'");

}
?>
