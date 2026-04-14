<?php 
include_once('../inc/functions.php');

$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);

$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);

$geneSymbol1 = $vali->getInput('geneSymbol1', 'ignet 1', 2, 60);
$score = $vali->getInput('score', 'Score', 0, 10);
$hasVaccine = $vali->getInput('hasVaccine', '"Vaccine" metioned?', 0, 10);


$strSql="SELECT distinct geneSymbol1 FROM t_sentence_hit_gene2gene_Host WHERE geneSymbol2='$geneSymbol1' and score>0";
if ($score != '') {
	$strSql .= " AND score > $score";
}
if ($hasVaccine != '') {
	$strSql .= " AND hasVaccine = $hasVaccine";
}
$rs = $db->Execute($strSql);
foreach($rs as $row) {
	$geneSymbols[$row['geneSymbol1']] = 1;
}
$rs->close();

$strSql="SELECT distinct geneSymbol2 FROM t_sentence_hit_gene2gene_Host WHERE geneSymbol1='$geneSymbol1' and score>0 ";
if ($score != '') {
	$strSql .= " AND score > $score";
}
if ($hasVaccine != '') {
	$strSql .= " AND hasVaccine = $hasVaccine";
}
$rs = $db->Execute($strSql);
foreach($rs as $row) {
	$geneSymbols[$row['geneSymbol2']] = 1;
}
$rs->close();

ksort($geneSymbols);

$array_gene=array();

foreach ($geneSymbols as $gene=>$tmp) { 
	$array_gene[]=$gene;
}

print(json_encode($array_gene));
?>
