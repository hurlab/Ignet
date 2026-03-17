<?php 
include_once('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);

$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);

$geneSymbol1 = $vali->getInput('geneSymbol1', 'ignet 1', 2, 60);
$geneSymbol1 = sanitizeGeneSymbol($geneSymbol1);
$geneSymbol2 = $vali->getInput('geneSymbol2', 'ignet 2', 0, 60);
$geneSymbol2 = sanitizeGeneSymbol($geneSymbol2);
$score = $vali->getInput('score', 'Score', 0, 10);
$hasVaccine = $vali->getInput('hasVaccine', '"Vaccine" metioned?', 0, 10);

$orderBy = $vali->getInput('orderBy', 'Order by', 0, 60);
$order = $vali->getInput('order', 'Accending or Decending', 0, 60);
$orderBy = sanitizeOrderBy($orderBy, ['geneSymbol1','geneSymbol2','geneMatch1','geneMatch2','Score','hasVaccine','score'], '');
$order = sanitizeOrder($order);
$currPage = $vali->getNumber('currPage', 'Current Page', 1, 5);

$strSql = "SELECT c_hit_id FROM t_sentence_hit_gene2gene_Host WHERE ";
$strSql .= "  ((geneSymbol1 = " . $db->qstr($geneSymbol1) . " AND geneSymbol2 = " . $db->qstr($geneSymbol2) . ") OR (geneSymbol2 = " . $db->qstr($geneSymbol1) . " AND geneSymbol1 = " . $db->qstr($geneSymbol2) . "))";

if ($score != '') {
	$strSql .= " AND score > " . (float)$score;
}
if ($hasVaccine != '') {
	$strSql .= " AND hasVaccine = " . (int)$hasVaccine;
}

if ($keywords != '') {
	$tkeywords = transformKeywords($keywords);
	$strSql .= " AND MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
}

if ($orderBy != '') {
	$strSql .= " ORDER BY $orderBy $order";
}

//print($strSql);

// Build COUNT query using the same WHERE clause
$strSqlCount = "SELECT COUNT(*) FROM t_sentence_hit_gene2gene_Host WHERE ";
$strSqlCount .= "  ((geneSymbol1 = " . $db->qstr($geneSymbol1) . " AND geneSymbol2 = " . $db->qstr($geneSymbol2) . ") OR (geneSymbol2 = " . $db->qstr($geneSymbol1) . " AND geneSymbol1 = " . $db->qstr($geneSymbol2) . "))";

if ($score != '') {
	$strSqlCount .= " AND score > " . (float)$score;
}
if ($hasVaccine != '') {
	$strSqlCount .= " AND hasVaccine = " . (int)$hasVaccine;
}
if ($keywords != '') {
	$tkeywords = transformKeywords($keywords);
	$strSqlCount .= " AND MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
}

$numOfRecords = (int)$db->GetOne($strSqlCount);

if ($numOfRecords > 0)
{
	$recordsPerPage = 50;
	$numOfPage = ceil($numOfRecords / $recordsPerPage);

	if ($currPage == '' || $currPage > $numOfPage || $numOfPage < 1) {
		$currPage = 1;
	}
	$params = "?geneSymbol1=" . urlencode($geneSymbol1) . "&geneSymbol2=" . urlencode($geneSymbol2) . "&score=" . urlencode($score) . "&hasVaccine=" . urlencode($hasVaccine) . "&keywords=" . urlencode($keywords);

	$offset = ($currPage - 1) * $recordsPerPage;

	$strSqlPage = "select * FROM t_sentence_hit_gene2gene_Host where ";
	$strSqlPage .= "  ((geneSymbol1 = " . $db->qstr($geneSymbol1) . " AND geneSymbol2 = " . $db->qstr($geneSymbol2) . ") OR (geneSymbol2 = " . $db->qstr($geneSymbol1) . " AND geneSymbol1 = " . $db->qstr($geneSymbol2) . "))";

	if ($score != '') {
		$strSqlPage .= " AND score > " . (float)$score;
	}
	if ($hasVaccine != '') {
		$strSqlPage .= " AND hasVaccine = " . (int)$hasVaccine;
	}
	if ($keywords != '') {
		$strSqlPage .= " AND MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
	}
	if ($orderBy != '') {
		$strSqlPage .= " ORDER BY $orderBy $order";
	}
	$strSqlPage .= " LIMIT $recordsPerPage OFFSET $offset";

	$rs = $db->Execute($strSqlPage);
	$array_ignet = array();
	if ($rs && !$rs->EOF) {
		$array_ignet = $rs->GetArray();
		$rs->close();
	}


?>
<p> Found
	<?php echo $numOfRecords?>
	record(s). Please click more for detail information. </p>
<table border="0">
	<tr>
		<td bgcolor="#F5FAF7" class="tdData" style="padding-left:20px; padding-right:20px "><strong>Record:</strong>
				<?php echo (($currPage-1) * $recordsPerPage + 1)?>
			to
			<?php echo ($currPage * $recordsPerPage) < $numOfRecords? ($currPage * $recordsPerPage) :$numOfRecords?>
			of
			<?php echo $numOfRecords?>
			Records. </td>
		<td bgcolor="#F5FAF7" class="tdData" style="padding-left:20px; padding-right:20px "><strong>Page:</strong>
				<?php echo $currPage?>
			of
			<?php echo $numOfPage?>
			,
			<?php 
	if ($currPage > 1) {
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params?>&currPage=1')">First</span>
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
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params?>&currPage=<?php echo $currPage-1?>')">Previous </span>
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
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params?>&currPage=<?php echo $currPage+1?>')">Next</span>
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
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params?>&currPage=<?php echo $numOfPage?>')">Last</span>
			<?php 
	}
	else {
?>
			Last
			<?php 
	}
?>
		</td>
	</tr>
</table>
<table border="0" cellpadding="2" cellspacing="2">
	<tr>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">PubMed</td>
		<td aligt_sentence_hit_gene2gene_Hostn="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='geneSymbol1') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=geneSymbol1&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=geneSymbol1&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=geneSymbol1&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params0?>')" title="Sort by Gene1">Gene1</span> </td>
		<td height="25" align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='geneSymbol2') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=geneSymbol2&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=geneSymbol2&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=geneSymbol2&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params0?>')" title="Sort by Gene1">Gene2</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='geneMatch1') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=geneMatch1&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=geneMatch1&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=geneMatch1&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params0?>')" title="Sort by Gene1">Match1</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='geneMatch2') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=geneMatch2&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=geneMatch2&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=geneMatch2&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params0?>')" title="Sort by Gene1">Match2</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='Score') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=Score&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=Score&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=Score&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params0?>')" title="Sort by Gene1">Score</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='hasVaccine') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=hasVaccine&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=hasVaccine&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=hasVaccine&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results1, '<?php echo $params0?>')" title="Sort by Gene1">&quot;Vaccine&quot; mentioned</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Sentence</td>
	</tr>
	<?php 
	foreach ($array_ignet as $ignet) {
?>
	<tr>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><a href="http://www.ncbi.nlm.nih.gov/pubmed/<?php echo htmlspecialchars($ignet['PMID'], ENT_QUOTES, 'UTF-8')?>" target="_blank">
			<?php echo htmlspecialchars($ignet['PMID'], ENT_QUOTES, 'UTF-8')?>
		</a></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($ignet['geneSymbol1'], ENT_QUOTES, 'UTF-8')?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($ignet['geneSymbol2'], ENT_QUOTES, 'UTF-8')?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($ignet['geneMatch1'], ENT_QUOTES, 'UTF-8')?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($ignet['geneMatch2'], ENT_QUOTES, 'UTF-8')?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($ignet['score'], ENT_QUOTES, 'UTF-8')?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($ignet['hasVaccine'], ENT_QUOTES, 'UTF-8')?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo formatOutput($ignet['sentence'], $keywords)?></td>
	</tr>
	<?php 
	}
?>
</table>
<p align="center">&nbsp; </p>
<?php 
}
else {
?>
<p align="center">&nbsp; </p>
<p align="center">No record was found. Please use different criteria. </p>
<?php 
}
?>

