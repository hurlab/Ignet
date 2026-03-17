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

$order_by = $vali->getInput('order_by', 'Order by', 0, 20);
$order = $vali->getInput('order', 'Order', 0, 20);
$order_by = $order_by=='' ? 'score':$order_by;
$order = $order=='' ? 'DESC':$order;
$order_by = sanitizeOrderBy($order_by, ['geneSymbol1','score','hasVaccine'], 'score');
$order = sanitizeOrder($order);
$currPage = $vali->getNumber('currPage', 'Current Page', 1, 5);


$params = "&geneSymbol1=" . urlencode($geneSymbol1) . "&score=" . urlencode($score) . "&hasVaccine=" . urlencode($hasVaccine) . "&keywords=" . urlencode($keywords);

if (strlen($vali->getErrorMsg())==0) { 
	$strSql="SELECT * FROM t_centrality_score_gene2gene_whole";
	$rs = $db->Execute($strSql);
	
	$cen_scores = array();
	foreach ($rs as $row) {
		$cen_scores[$row['score_type']][$row['genesymbol']]=$row['score'];
	}

	if (!empty($cen_scores)) {
?>
<p style="font-weight:bold">The rankings of <?php echo htmlspecialchars($geneSymbol1, ENT_QUOTES, 'UTF-8')?> based on centrality scores:</p>
<p>
<?php 		
		if (isset($cen_scores['d'][$geneSymbol1])) {
			$array_tmp=$cen_scores['d'];
			asort($array_tmp);
			$array_tmp=array_keys($array_tmp);
			for($i=0; $i<sizeof($array_tmp); $i++) {
				if ($array_tmp[$i]==$geneSymbol1) break;
			}
?>
Degree centrality: <?php echo round(($i+1)/sizeof($array_tmp)*100, 2)?>%<br />
<?php 
		}
		if (isset($cen_scores['p'][$geneSymbol1])) {
			$array_tmp=$cen_scores['p'];
			asort($array_tmp);
			$array_tmp=array_keys($array_tmp);
			for($i=0; $i<sizeof($array_tmp); $i++) {
				if ($array_tmp[$i]==$geneSymbol1) break;
			}
?>
Eigenvector centrality: <?php echo round(($i+1)/sizeof($array_tmp)*100, 2)?>%<br />
<?php 
		}
		if (isset($cen_scores['c'][$geneSymbol1])) {
			$array_tmp=$cen_scores['c'];
			asort($array_tmp);
			$array_tmp=array_keys($array_tmp);
			for($i=0; $i<sizeof($array_tmp); $i++) {
				if ($array_tmp[$i]==$geneSymbol1) break;
			}
?>
Closeness centrality: <?php echo round(($i+1)/sizeof($array_tmp)*100, 2)?>%<br />
<?php 
		}
		if (isset($cen_scores['b'][$geneSymbol1])) {
			$array_tmp=$cen_scores['b'];
			asort($array_tmp);
			$array_tmp=array_keys($array_tmp);
			for($i=0; $i<sizeof($array_tmp); $i++) {
				if ($array_tmp[$i]==$geneSymbol1) break;
			}
?>
Betweenness centrality: <?php echo round(($i+1)/sizeof($array_tmp)*100, 2)?>%<br />
<?php 
		}
?>
</p>
<?php 
	}

#	$strSql="(SELECT geneSymbol2 as geneSymbol1, score, hasVaccine FROM t_sentence_hit_gene2gene_Host where  geneSymbol1 = '$geneSymbol1'";
	$strSql="(SELECT geneSymbol2 as geneSymbol1, score, hasVaccine, matching_term, term_id FROM t_sentence_hit_gene2gene_Host LEFT JOIN sentence_vaccine ON t_sentence_hit_gene2gene.pmid = sentence_vaccine.PMID where geneSymbol1=" . $db->qstr($geneSymbol1);
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

#	$strSql.="UNION (SELECT geneSymbol1 as geneSymbol1, score, hasVaccine FROM t_sentence_hit_gene2gene_Host where geneSymbol2 = '$geneSymbol1'";
	$strSql.="UNION (SELECT geneSymbol1 as geneSymbol1, score, hasVaccine, matching_term, term_id FROM t_sentence_hit_gene2gene_Host LEFT JOIN sentence_vaccine ON t_sentence_hit_gene2gene.pmid = sentence_vaccine.PMID where geneSymbol2 = " . $db->qstr($geneSymbol1);
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
	$strSql.= " order by $order_by $order";
	
	
//	print($strSql);
	
	// Build a COUNT query to get total rows and unique gene count
	$strSqlCount = "(SELECT geneSymbol2 as geneSymbol1 FROM t_sentence_hit_gene2gene_Host LEFT JOIN sentence_vaccine ON t_sentence_hit_gene2gene.pmid = sentence_vaccine.PMID where geneSymbol1=" . $db->qstr($geneSymbol1);
	if ($score!='') {
		$strSqlCount .= " and score>=" . (float)$score;
	}
	if ($hasVaccine!='') {
		$strSqlCount .= " and hasVaccine>=" . (int)$hasVaccine;
	}
	if ($keywords != '') {
		$tkeywords = transformKeywords($keywords);
		$strSqlCount .= " AND MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
	}
	$strSqlCount .= ") UNION (SELECT geneSymbol1 as geneSymbol1 FROM t_sentence_hit_gene2gene_Host LEFT JOIN sentence_vaccine ON t_sentence_hit_gene2gene.pmid = sentence_vaccine.PMID where geneSymbol2 = " . $db->qstr($geneSymbol1);
	if ($score!='') {
		$strSqlCount .= " and score>=" . (float)$score;
	}
	if ($hasVaccine!='') {
		$strSqlCount .= " and hasVaccine>=" . (int)$hasVaccine;
	}
	if ($keywords != '') {
		$strSqlCount .= " AND MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
	}
	$strSqlCount .= ")";

	$rsCount = $db->Execute($strSqlCount);
	$unique_genes = array();
	$numOfRecords = 0;
	if ($rsCount && !$rsCount->EOF) {
		while (!$rsCount->EOF) {
			$unique_genes[$rsCount->fields['geneSymbol1']] = 1;
			$numOfRecords++;
			$rsCount->MoveNext();
		}
		$rsCount->close();
	}

	if ($numOfRecords > 0) {
		$recordsPerPage = 500;
		$numOfPage = ceil($numOfRecords / $recordsPerPage);

		if ($currPage == '' || $currPage > $numOfPage || $numOfPage < 1) {
			$currPage = 1;
		}

		$offset = ($currPage - 1) * $recordsPerPage;
		$strSql .= " LIMIT $recordsPerPage OFFSET $offset";

		$rs = $db->Execute($strSql);
		$array_gene_list = array();
		if ($rs && !$rs->EOF) {
			$array_gene_list = $rs->GetArray();
			$rs->close();
		}
?>

<p><strong>Gene neighbors with matching sentences:</strong></p>
		<p> Found <?php echo sizeof($unique_genes)?> genes from 
			<?php echo $numOfRecords?> matching
			sentence(s). </p>
		<table border="0">
			<tr>
				<td bgcolor="#F5FAF7" class="smallContent"><strong>Record:</strong>
						<?php echo (($currPage-1) * $recordsPerPage + 1)?>
					to
					<?php echo ($currPage * $recordsPerPage) < $numOfRecords? ($currPage * $recordsPerPage) :$numOfRecords?>
					of
					<?php echo $numOfRecords?>
					Records. </td>
			</tr>
			<tr>
				<td bgcolor="#F5FAF7" class="smallContent"><strong>Page:</strong>
						<?php echo $currPage?>
					of
					<?php echo $numOfPage?>
					,
					<?php 
	if ($currPage > 1) {
?>
					<span style="cursor:pointer; color:#0000FF" onclick="reloadDiv(div_results1, 'getRelatedGenes.php?currPage=1&order_by=<?php echo $order_by?>&order=<?php echo $order?><?php echo $params?>');">First</span>
					<?php 
	}
	else {
?>
					First
					<?php 
	}
?>
					,
					<?php 
	if ($currPage > 1) {
?>
					<span style="cursor:pointer; color:#0000FF" onclick="reloadDiv(div_results1, 'getRelatedGenes.php?currPage=<?php echo $currPage-1?>&order_by=<?php echo $order_by?>&order=<?php echo $order?><?php echo $params?>');">Previous</span>
					<?php 
	}
	else {
?>
					Previous
					<?php 
	}
?>
					,
					<?php 
	if ($currPage < $numOfPage) {
?>
					<span style="cursor:pointer; color:#0000FF" onclick="reloadDiv(div_results1, 'getRelatedGenes.php?currPage=<?php echo $currPage+1?>&order_by=<?php echo $order_by?>&order=<?php echo $order?><?php echo $params?>');">Next</span>
					<?php 
	}
	else {
?>
					Next
					<?php 
	}
?>
					,
					<?php 
	if ($currPage < $numOfPage) {
?>
					<span style="cursor:pointer; color:#0000FF" onclick="reloadDiv(div_results1, 'getRelatedGenes.php?currPage=<?php echo $numOfPage?>&order_by=<?php echo $order_by?>&order=<?php echo $order?><?php echo $params?>');">Last</span>
					<?php 
	}
	else {
?>
					Last
					<?php 
	}
?>				</td>
			</tr>
		</table>
<table border="0" cellpadding="4" bgcolor="#FFFFFF">
  <tr>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php 
	if ($order_by=='geneSymbol1') {
		if ($order == 'ASC') {
			$params0 = "?currPage=$currPage&order_by=geneSymbol1&order=DESC".$params;
?>
<img src="../images/asc.gif" alt="ASC" />
<?php 		
		}
		else {
			$params0 = "?currPage=$currPage&order_by=geneSymbol1&order=ASC".$params;
?>
<img src="../images/desc.gif" alt="DESC" />
<?php 		
		}
	}
	else {
		$params0 = "?currPage=$currPage&order_by=geneSymbol1&order=ASC".$params;
	}
?>
      <span style="cursor:pointer" onclick="reloadDiv(div_results1, 'getRelatedGenes.php<?php echo $params0?>');" title="Sort by Gene Name">Gene Name</span> 
	 </td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php 
	if ($order_by=='score') {
		if ($order == 'ASC') {
			$params0 = "?currPage=$currPage&order_by=score&order=DESC".$params;
?>
<img src="../images/asc.gif" alt="ASC" />
<?php 		
		}
		else {
			$params0 = "?currPage=$currPage&order_by=score&order=ASC".$params;
?>
<img src="../images/desc.gif" alt="DESC" />
<?php 		
		}
	}
	else {
		$params0 = "?currPage=$currPage&order_by=score&order=ASC".$params;
	}
?>
      <span style="cursor:pointer" onclick="reloadDiv(div_results1, 'getRelatedGenes.php<?php echo $params0?>');" title="Sort by Dissimilarity">Score</span> 
	</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php 
	if ($order_by=='hasVaccine') {
		if ($order == 'ASC') {
			$params0 = "?currPage=$currPage&order_by=hasVaccine&order=DESC".$params;
?>
<img src="../images/asc.gif" alt="ASC" />
<?php 		
		}
		else {
			$params0 = "?&currPage=$currPage&order_by=hasVaccine&order=ASC".$params;
?>
<img src="../images/desc.gif" alt="DESC" />
<?php 		
		}
	}
	else {
		$params0 = "?currPage=$currPage&order_by=hasVaccine&order=ASC".$params;
	}
?>
      <span style="cursor:pointer" onclick="reloadDiv(div_results1, 'getRelatedGenes.php<?php echo $params0?>');" title="Sort by P value">"Vaccine" metioned?</span> 
	 </td>


    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php
        if ($order_by=='hasVaccine') {
                if ($order == 'ASC') {
                        $params0 = "?currPage=$currPage&order_by=hasVaccine&order=DESC".$params;
?>
<img src="../images/asc.gif" alt="ASC" />
<?php
                }
                else {
                        $params0 = "?&currPage=$currPage&order_by=hasVaccine&order=ASC".$params;
?>
<img src="../images/desc.gif" alt="DESC" />
<?php
                }
        }
    else {
                $params0 = "?currPage=$currPage&order_by=hasVaccine&order=ASC".$params;
        }
?>
      <span style="cursor:pointer" onclick="reloadDiv(div_results1, 'getRelatedGenes.php<?php echo $params0?>');" title="Sort by P value"> VO vaccine(s) mentioned in abstract</span>
         </td>






  </tr>
<?php 
		$bgcolor="#F4F9FD";
		foreach($array_gene_list as $gene_list) {
			if ($bgcolor=="#F4F9FD") {
				$bgcolor="#F7F7E1";
			}
			else {
				$bgcolor="#F4F9FD";
			}
?>
  <tr>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><a href="index.php?geneSymbol1=<?php echo htmlspecialchars($gene_list['geneSymbol1'], ENT_QUOTES, 'UTF-8')?>"><?php echo htmlspecialchars($gene_list['geneSymbol1'], ENT_QUOTES, 'UTF-8')?></a></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><a target="_blank" href="../genepair/index.php?geneSymbol1=<?php echo htmlspecialchars($geneSymbol1, ENT_QUOTES, 'UTF-8')?>&amp;geneSymbol2=<?php echo htmlspecialchars($gene_list['geneSymbol1'], ENT_QUOTES, 'UTF-8')?>">
    	<?php echo sprintf("%.4f", (float)$gene_list['score'])?>
    	</a></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo $gene_list['hasVaccine']==1 ? 'Y' : 'N'?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><a href="http://purl.obolibrary.org/obo/<?php echo htmlspecialchars($gene_list['term_id'], ENT_QUOTES, 'UTF-8')?>"><?php echo htmlspecialchars($gene_list['matching_term'], ENT_QUOTES, 'UTF-8');?></a></td>
  </tr>
<?php 
		}
?>
</table>
<?php
	}
	else {
?>
No close related gene returned!
<?php
	}
}
else {
?>
<p align="center">&nbsp; </p>
<p align="center">Please select a gene!</p>
<?php 
}
?>
