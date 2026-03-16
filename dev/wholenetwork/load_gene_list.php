<?php 
chdir(dirname(__FILE__));
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

/*
$strSql="TRUNCATE TABLE t_gene_list";
$db->Execute($strSql);


$strSql="INSERT IGNORE INTO t_gene_list (c_genesymbol) SELECT distinct geneSymbol1 FROM t_sentence_hit_gene2gene";
$db->Execute($strSql);

$strSql="INSERT IGNORE INTO t_gene_list (c_genesymbol) SELECT distinct geneSymbol2 FROM t_sentence_hit_gene2gene";
$db->Execute($strSql);



$strSql="SELECT distinct geneSymbol1 FROM t_sentence_hit_gene2gene where score>0";
$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$strSql="UPDATE t_gene_list SET c_score='y' WHERE c_genesymbol='".$row['geneSymbol1']."'";
	$db->Execute($strSql);
}

$strSql="SELECT distinct geneSymbol2 FROM t_sentence_hit_gene2gene where score>0";
$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$strSql="UPDATE t_gene_list SET c_score='y' WHERE c_genesymbol='".$row['geneSymbol2']."'";
	$db->Execute($strSql);
}



$strSql="SELECT distinct geneSymbol1 FROM t_sentence_hit_gene2gene where hasvaccine=1";
$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$strSql="UPDATE t_gene_list SET c_hasvaccine=1 WHERE c_genesymbol='".$row['geneSymbol1']."'";
	$db->Execute($strSql);
}

$strSql="SELECT distinct geneSymbol2 FROM t_sentence_hit_gene2gene where hasvaccine=1";
$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	$strSql="UPDATE t_gene_list SET c_hasvaccine=1 WHERE c_genesymbol='".$row['geneSymbol2']."'";
	$db->Execute($strSql);
}

*/
$lines = file('http://www.genenames.org/cgi-bin/hgnc_downloads.cgi?title=HGNC+output+data&hgnc_dbtag=on&col=gd_hgnc_id&col=gd_app_sym&col=gd_app_name&col=gd_aliases&status=Approved&status_opt=2&where=%28%28gd_pub_chrom_map+not+like+%27%25patch%25%27+and+gd_pub_chrom_map+not+like+%27%25ALT_REF%25%27%29+or+gd_pub_chrom_map+IS+NULL%29+and+gd_locus_type+%3D+%27gene+with+protein+product%27&order_by=gd_app_sym_sort&format=text&limit=&submit=submit&.cgifields=&.cgifields=chr&.cgifields=status&.cgifields=hgnc_dbtag', FILE_IGNORE_NEW_LINES);

unset($lines[0]);
foreach($lines as $line) {
	$tokens = preg_split('/\t/', $line);
	$hugo_id=str_replace('HGNC:', '', $tokens[0]);
	$strSql="UPDATE t_gene_list SET c_hugo_id=$hugo_id, c_gene_product=". $db->qstr($tokens[2]). ", c_synonyms=". $db->qstr($tokens[3]). "  WHERE c_genesymbol='{$tokens[1]}'";
	$db->Execute($strSql);
}
?>
Done!
