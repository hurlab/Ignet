<?php 
include('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);
$geneSymbol1 = $vali->getInput('geneSymbol1', 'Gene Name', 1, 60, true);
$geneSymbol1 = sanitizeGeneSymbol($geneSymbol1);
$score = $vali->getInput('score', 'Score', 0, 60, true);
$hasVaccine = $vali->getInput('hasVaccine', '"Vaccine" metioned?', 0, 60, true);
$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);

if (strlen($vali->getErrorMsg())==0) { 
	$c_job_key = preg_replace('/\W+/', '_', $geneSymbol1);
	
	$strSql="(SELECT distinct geneSymbol2 FROM t_sentence_hit_gene2gene where  geneSymbol1 = " . $db->qstr($geneSymbol1);
	if ($score!='') {
		$strSql .= " and score>=" . (float)$score;
	}
	if ($hasVaccine!='') {
		$strSql .= " and hasVaccine>=" . (int)$hasVaccine;
	}
	if ($keywords != '') {
		$tkeywords = transformKeywords($keywords);
		$strSql .= " AND MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
	}
	$strSql .= ") ";

	$strSql.="UNION (SELECT distinct geneSymbol1 as geneSymbol2 FROM t_sentence_hit_gene2gene where  geneSymbol2 = " . $db->qstr($geneSymbol1);
	if ($score!='') {
		$strSql .= " and score>=" . (float)$score;
	}
	if ($hasVaccine!='') {
		$strSql .= " and hasVaccine>=" . (int)$hasVaccine;
	}
	if ($keywords != '') {
		$tkeywords = transformKeywords($keywords);
		$strSql .= " AND MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
	}
	$strSql .= ") ";
		
	$rs = $db->Execute($strSql);
	if (!$rs->EOF && $rs->RecordCount()<100) {
		$array_gene_list = $rs->GetArray();
		
		$dot_txt = "graph G {\n graph[splines=true, overlap=false, dpi=72];\n";
		$dot_txt .= "node[fontsize=12, fontname=Arial, style=filled, fillcolor=\"#88ff88\"];\n";
		$dot_txt .= "edge [penwidth=2.0];\n";
		$safeGene1 = htmlspecialchars($geneSymbol1, ENT_QUOTES, 'UTF-8');
		$dot_txt .= "\"$safeGene1\" [fillcolor=dodgerblue1];\n";
		
		foreach($array_gene_list as $gene_list) {
			$edge_color='#FF3300';
			$geneSymbol2 = trim($gene_list['geneSymbol2']);
			$safeGene2 = htmlspecialchars($geneSymbol2, ENT_QUOTES, 'UTF-8');
			$dot_txt .= '"'. $safeGene1 . '"--"' . $safeGene2 . "\"  [URL=\"../genepair/index.php?geneSymbol1=" . urlencode($geneSymbol1) . "&geneSymbol2=" . urlencode($geneSymbol2) . "\", color=\"$edge_color\"];\n";

			if ($geneSymbol2 != $geneSymbol1) {
				$dot_txt .= "\"$safeGene2\" [URL=\"index.php?geneSymbol1=" . urlencode($geneSymbol2) . "\"];\n";
			}
		}
		$dot_txt .= "}";

		// Check for directory and create it if it doesn't exist
		if (!file_exists("../tmp/ignet")) {
			// The `true` parameter allows recursive directory creation
			mkdir("../tmp/ignet", 0775, true);
		}
		
		$path_txt = "../tmp/ignet/$c_job_key.txt";
		$path_png = "../tmp/ignet/$c_job_key.png";
		$path_map = "../tmp/ignet/$c_job_key.map";
		
		file_put_contents($path_txt, $dot_txt);
		
		// Secure the command-line arguments to prevent command injection
		$safe_png_path = escapeshellarg($path_png);
		$safe_map_path = escapeshellarg($path_map);
		$safe_txt_path = escapeshellarg($path_txt);

		// Execute the command and capture output and return status for error checking
		$command = "fdp -Tpng -o $safe_png_path -Tcmap -o $safe_map_path $safe_txt_path 2>&1";
		exec($command, $exec_output, $return_code);

		// Check if the image was successfully created
		if ($return_code !== 0 || !file_exists($path_png)) {
			echo "<p><b>Error:</b> Could not generate the network image.</p>";
			echo "<p>This may be due to the Graphviz library not being installed on the server or incorrect file permissions on the '/tmp/ignet/' directory.</p>";
			echo "<pre>Debug Info: " . htmlspecialchars(implode("\n", $exec_output)) . "</pre>";
		} else {
			// If successful, just print the map content. DO NOT use include().
			print(file_get_contents($path_map));
		}
	}
	else {
?>
<p>Found <?php echo (int)$rs->RecordCount()?> gene neighbors of <strong><?php echo htmlspecialchars($geneSymbol1, ENT_QUOTES, 'UTF-8'); ?></strong>. Gene interaction network image will appear only with <100 neighboring genes.</p>
<?php 
	}
	$rs->close();
}
?>
