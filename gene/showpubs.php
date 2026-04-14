<?php 
include('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);
$geneSymbol1 = $vali->getInput('geneSymbol1', 'Gene Name', 2, 50, true);
$geneSymbol1 = sanitizeGeneSymbol($geneSymbol1);
$score = $vali->getInput('score', 'Score', 0, 60, true);
$hasVaccine = $vali->getInput('hasVaccine', '"Vaccine" metioned?', 0, 60, true);
$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);

$currPage = $vali->getNumber('currPage', 'Current Page', 1, 5);
$order_by = $vali->getInput('order_by', 'Order by', 0, 20);
$order = $vali->getInput('order', 'Order', 0, 20);
$order_by = $order_by=='' ? 'score':$order_by;
$order = $order=='' ? 'DESC':$order;
$order_by = sanitizeOrderBy($order_by, ['score','PMID','sentenceID'], 'score');
$order = sanitizeOrder($order);

$params = "&geneSymbol1=" . urlencode($geneSymbol1) . "&score=" . urlencode($score) . "&hasVaccine=" . urlencode($hasVaccine) . "&keywords=" . urlencode($keywords);

if (strlen($vali->getErrorMsg())==0) { 
	$strSql="SELECT distinct `PMID`, `sentenceID`, `sentence`  FROM t_sentence_hit_gene2gene_Host where  (geneSymbol1 = " . $db->qstr($geneSymbol1) . " or geneSymbol2 = " . $db->qstr($geneSymbol1) . ")";
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

	// Build COUNT query using the same WHERE clause
	$strSqlCount = "SELECT COUNT(DISTINCT `PMID`, `sentenceID`) FROM t_sentence_hit_gene2gene_Host where (geneSymbol1 = " . $db->qstr($geneSymbol1) . " or geneSymbol2 = " . $db->qstr($geneSymbol1) . ")";
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

	$numOfRecords = (int)$db->GetOne($strSqlCount);

	$recordsPerPage = 50;
	$numOfPage = ceil($numOfRecords / $recordsPerPage);

	if ($currPage == '' || $currPage > $numOfPage || $numOfPage < 1) {
		$currPage = 1;
	}

	$offset = ($currPage - 1) * $recordsPerPage;
	$strSql .= " LIMIT $recordsPerPage OFFSET $offset";

	$rs = $db->Execute($strSql);
	$array_pub_list = array();
	if ($rs && !$rs->EOF) {
		$array_pub_list = $rs->GetArray();
		$rs->close();
	}
?>

<p><?php echo (int)$numOfRecords?> publications relate to <?php echo htmlspecialchars($geneSymbol1, ENT_QUOTES, 'UTF-8')?></p>
		<table border="0">
			<tr>
				<td bgcolor="#F5FAF7" class="smallContent"><strong>Record:</strong>
						<?php echo (($currPage-1) * $recordsPerPage + 1)?>
					to
					<?php echo ($currPage * $recordsPerPage) < $numOfRecords? ($currPage * $recordsPerPage) :$numOfRecords?>
					of
					<?php echo $numOfRecords?>
					Records. </td>
				<td bgcolor="#F5FAF7" class="smallContent"><strong>Page:</strong>
						<?php echo $currPage?>
					of
					<?php echo $numOfPage?>
					,
					<?php 
	if ($currPage > 1) {
?>
					<span style="cursor:pointer; color:#0000FF" onclick="reloadDiv(div_results2, 'showpubs.php?currPage=1&order_by=<?php echo $order_by?>&order=<?php echo $order?><?php echo $params?>');">First</span>
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
					<span style="cursor:pointer; color:#0000FF" onclick="reloadDiv(div_results2, 'showpubs.php?currPage=<?php echo $currPage-1?>&order_by=<?php echo $order_by?>&order=<?php echo $order?><?php echo $params?>');">Previous</span>
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
					<span style="cursor:pointer; color:#0000FF" onclick="reloadDiv(div_results2, 'showpubs.php?currPage=<?php echo $currPage+1?>&order_by=<?php echo $order_by?>&order=<?php echo $order?><?php echo $params?>');">Next</span>
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
					<span style="cursor:pointer; color:#0000FF" onclick="reloadDiv(div_results2, 'showpubs.php?currPage=<?php echo $numOfPage?>&order_by=<?php echo $order_by?>&order=<?php echo $order?><?php echo $params?>');">Last</span>
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
<table border="0" cellpadding="4">
  <tr>
    <td align="center" bgcolor="#E4E4E4" class="styleLeftColumn">#</td>
    <td align="center" bgcolor="#E4E4E4" class="styleLeftColumn">PMID</td>
    <td align="center" bgcolor="#E4E4E4" class="styleLeftColumn">Sentence</td>
  </tr>
<?php 
	$i=0;
	foreach ($array_pub_list as $row) {
		$i++;
?>
  <tr>
    <td valign="top" bgcolor="#F4F9FD" class="smallContent"><b><?php echo $i?></b></td>
    <td valign="top" bgcolor="#F4F9FD" class="smallContent">
<a href="http://www.ncbi.nlm.nih.gov/pubmed/<?php echo htmlspecialchars($row['PMID'], ENT_QUOTES, 'UTF-8')?>" target="_blank"><?php echo htmlspecialchars($row['PMID'], ENT_QUOTES, 'UTF-8')?></a>
	</td>
    <td valign="top" bgcolor="#F4F9FD" class="smallContent">
<?php
 if ($keywords!='') {
		echo(formatOutput($row['sentence'], array($keywords)));
}
else {
	echo htmlspecialchars($row['sentence'], ENT_QUOTES, 'UTF-8');
}
?>    
    </td>
  </tr>
<?php 
	}
?>
</table>
<?php 	
}
else {
?>
<p align="center">&nbsp; </p>
<p align="center">Please select a gene!</p>
<?php 
}
?>
