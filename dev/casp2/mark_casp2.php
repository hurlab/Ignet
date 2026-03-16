<?php 
chdir(dirname(__FILE__));
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);


//$strSql="update t_sentence_hit_gene2gene set in_casp2_network=0";
//$db->Execute($strSql);

$strSql="update t_sentence_hit_gene2gene set in_casp2_network=0";
$db->Execute($strSql);

$strSql="update t_sentence_hit_gene2gene set in_casp2_network=1 where  (genesymbol1='casp2' or  genesymbol2='casp2' ) and score>0";
$db->Execute($strSql);

$strSql="select * from t_sentence_hit_gene2gene where (genesymbol1='casp2' or genesymbol2='casp2') and score>0";


$symbols=array();
$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$symbols[]=$row['geneSymbol1'];
	$symbols[]=$row['geneSymbol2'];
}


$symbols=array_unique($symbols);

$strSql="update t_sentence_hit_gene2gene set in_casp2_network=1 where genesymbol1 in ('". join("', '", $symbols) ."') and genesymbol2 in ('". join("', '", $symbols) ."') and score>0";
$db->Execute($strSql);

$strSql="truncate table t_sentence_hit_gene2gene_casp2";
$db->Execute($strSql);

$strSql="insert ignore into  t_sentence_hit_gene2gene_casp2 SELECT * FROM t_sentence_hit_gene2gene where in_casp2_network=1;";
$db->Execute($strSql);


$strSql="update t_sentence_hit_gene2vaccine set in_casp2_network=0";
$db->Execute($strSql);
$strSql="update t_sentence_hit_gene2vaccine set in_casp2_network=1 where (genesymbol1 in ('". join("', '", $symbols) ."') or genesymbol2 in ('". join("', '", $symbols) ."')) and score>0";

$db->Execute($strSql);
?>
