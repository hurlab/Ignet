<?php 
include('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);
$c_species = $vali->getInput('c_species', 'Species', 1, 60, true);
$c_gene_name = $vali->getInput('c_gene_name', 'Gene Name', 1, 60, true);
$c_gene_name = sanitizeGeneSymbol($c_gene_name);

if (strlen($vali->getErrorMsg())==0) { 
	$c_job_key = preg_replace('/\W+/', '_', $c_species.'_'.$c_gene_name).'2';
	
	$strSql="SELECT * FROM t_gene_top_pair where c_species = " . $db->qstr($c_species) . " and (c_gene_name1 = " . $db->qstr($c_gene_name) . " or c_gene_name2 = " . $db->qstr($c_gene_name) . ") order by c_distance";
		
	$unique_pairs = array();	
	$unique_genes = array();
	$rs = $db->Execute($strSql);
	if (!$rs->EOF) {
		$array_gene_list = $rs->GetArray();
		
		
		if (sizeof($array_gene_list)>100) {
?>
<p>Too many edges!</p>
<?php 		
		}
		else 
		{
		
			$dot_txt = "graph G {\n graph[splines=true, overlap=false, dpi=72];\n";
			$dot_txt .= "node[fontsize=12, fontname=Arial, style=filled, fillcolor=\"#88ff88\"];\n";
			$dot_txt .= "edge [penwidth=2.0];\n";
			$dot_txt .= "$c_gene_name [fillcolor=dodgerblue1];\n";
			
			$array_pattern = array();
			$array_replace = array();
			
			foreach($array_gene_list as $gene_list) {
				if ($gene_list['c_shared_manuscripts']==0) {
					$edge_color='#FF3300';
				}
				else {
					$edge_color='#888888';
				}

				$c_gene_name1 = trim($gene_list['c_gene_name1']);
				$c_gene_name2 = trim($gene_list['c_gene_name2']);
						
				$dot_txt .= $c_gene_name1 . '--' . $c_gene_name2 . " [URL=\"../genepair/index.php?c_species=$c_species&c_gene_name1=$c_gene_name1&c_gene_name2=$c_gene_name2\", color=\"$edge_color\"];\n";
				$array_pattern[] = $c_gene_name1 . '&amp;c_gene_name2=' . $c_gene_name2;
				$array_replace[] = $c_gene_name1 . '&amp;c_gene_name2=' . $c_gene_name2 . "\" title=\"Dissimilarity: ". sprintf("%.4f", $gene_list['c_distance']) . ", P value: ". sprintf("%.4f", $gene_list['c_pvalue']) . ", shared manuscripts: ". $gene_list['c_shared_manuscripts'];
				
				$unique_pairs[$c_gene_name1 . '--' . $c_gene_name2] = 1;
	
				$related_gene = $c_gene_name1==$c_gene_name ? $c_gene_name2 : $c_gene_name1;
				$unique_genes[$related_gene] = 1;
				
		
				$strSql="SELECT * FROM t_gene_top_pair where c_species = " . $db->qstr($c_species) . " and (c_gene_name1 = " . $db->qstr($related_gene) . " or c_gene_name2 = " . $db->qstr($related_gene) . ") order by c_distance";
				
				$rs2 = $db->Execute($strSql);
				if (!$rs2->EOF) {
					$array_gene_list2 = $rs2->GetArray();
					
					foreach($array_gene_list2 as $gene_list2) {
						$c_gene_name1 = trim($gene_list2['c_gene_name1']);
						$c_gene_name2 = trim($gene_list2['c_gene_name2']);

						if (!array_key_exists($c_gene_name1 . '--' . $c_gene_name2, $unique_pairs) && !array_key_exists($c_gene_name2 . '--' . $c_gene_name1, $unique_pairs)) {
							if ($gene_list2['c_shared_manuscripts']==0) {
								$edge_color='#FF3300';
							}
							else {
								$edge_color='#888888';
							}
									
							$dot_txt .= $c_gene_name1 . '--' . $c_gene_name2 . " [URL=\"../genepair/index.php?c_species=$c_species&c_gene_name1=$c_gene_name1&c_gene_name2=$c_gene_name2\", color=\"$edge_color\"];\n";
							$array_pattern[] = $c_gene_name1 . '&amp;c_gene_name2=' . $c_gene_name2;
							$array_replace[] = $c_gene_name1 . '&amp;c_gene_name2=' . $c_gene_name2 . "\" title=\"Dissimilarity: ". sprintf("%.4f", $gene_list2['c_distance']) . ", P value: ". sprintf("%.4f", $gene_list2['c_pvalue']) . ", shared manuscripts: ". $gene_list2['c_shared_manuscripts'];
							$unique_pairs[$c_gene_name1 . '--' . $c_gene_name2] = 1;
	
							$unique_genes[$c_gene_name1] = 1;
							$unique_genes[$c_gene_name2] = 1;
						}
					}
				}
			}
			
			foreach($unique_genes as $gene_name => $value) {
				if ($gene_name != $c_gene_name) {
					$dot_txt .= "$gene_name [URL=\"index.php?c_species=$c_species&c_gene_name=$gene_name\"];\n";
				}
			}
			$dot_txt .= "}";
			
			if (!file_exists("/tmp/genomesh")) {
				mkdir("/tmp/genomesh");
			}
			
			file_put_contents("/tmp/genomesh/$c_job_key.txt", $dot_txt);
			
			exec("fdp -Tpng -o/tmp/genomesh/$c_job_key.png -Tcmap -o/tmp/genomesh/$c_job_key.map /tmp/genomesh/$c_job_key.txt");
//			exec("convert -density 72x72 /tmp/genomesh/$c_job_key.ps /tmp/genomesh/$c_job_key.png");
?>
<img src="../genemesh/get_image.php?c_job_key=<?php echo htmlspecialchars($c_species, ENT_QUOTES, 'UTF-8')?>_<?php echo htmlspecialchars($c_gene_name, ENT_QUOTES, 'UTF-8')?>2" usemap="#map001" id="img001" border="0"/>
<map name="map001" id="map001">
<?php 
			print(str_replace($array_pattern, $array_replace, file_get_contents("/tmp/genomesh/$c_job_key.map")));
?>
</map>
<?php 
		}
	}
	else {

	}
	$rs->close();
}
else {

}
?>
