<?php 
include_once('../inc/functions.php');

$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);

$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);

$score = $vali->getInput('score', 'Score', 0, 10);
$hasVaccine = $vali->getInput('hasVaccine', '"Vaccine" metioned?', 0, 10);

$geneSymbols =  array();
$strSql="SELECT c_genesymbol FROM t_gene_list WHERE 1=1";
if ($score != '') {
	$strSql .= " AND c_score='y' ";
}
if ($hasVaccine != '') {
	$strSql .= " AND c_hasvaccine = 1";
}
$strSql .= " order by c_genesymbol";


$rs = $db->Execute($strSql);
foreach($rs as $row) {
	$geneSymbols[$row['c_genesymbol']] = 1;
}
$rs->close();


$array_gene=array();

foreach ($geneSymbols as $gene=>$tmp) { 
	$array_gene[]=$gene;
}

print(json_encode($array_gene));
?>