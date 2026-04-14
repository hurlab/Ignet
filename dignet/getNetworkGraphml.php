<?php 
header("Content-type: text/xml; charset=utf-8");
header('Content-Disposition: "attachment"; filename="cytoscape.graphml"');

include('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);

$c_query_id = $vali->getInput('c_query_id', 'Query ID', 2, 60);


$strSql = "SELECT * FROM t_pubmed_query where c_query_id = '$c_query_id'";
$rs = $db->Execute($strSql);
if (!$rs->EOF) {
	$pubmedRecords=$rs->Fields('c_pubmed_records');
	
	$strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene_Host where pmid in ($pubmedRecords)";
	
	$pairs=array();
	$arrayNode=array();
	
	$rs = $db->Execute($strSql);
	$node_id = 0;
	foreach ($rs as $row) {
		if (!isset($pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]) && !isset($pairs[$row['geneSymbol2']."\t".$row['geneSymbol1']])) $pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]=1;

		$node_id++;
		$arrayNode[$row['geneSymbol1']]=$node_id;
		$node_id++;
		$arrayNode[$row['geneSymbol2']]=$node_id;
	}

	$gml_txt = "
<graphml>
	<key id=\"label\" for=\"all\" attr.name=\"label\" attr.type=\"string\"/>
	<graph edgedefault=\"undirected\">
";

	foreach ($arrayNode as $node => $node_id) {
			$gml_txt .= "
		<node id=\"$node_id\">
			<data key=\"label\">$node</data>
		</node>
";
	}
	
	
	foreach ($pairs as $pair=>$tmpValue) {
		$tokens = preg_split('/\t/', $pair);
		
		$gml_txt .= "	
		<edge source=\"{$arrayNode[$tokens[0]]}\" target=\"{$arrayNode[$tokens[1]]}\"	/>
";
	}
	
	$gml_txt .= "	
	</graph>
</graphml>";

	print($gml_txt);
}
?>
