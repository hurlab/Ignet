<?php 
include('inc/functions.php');
include('../../conf/config.php');
$db = NewADOConnection($driver);
$db->PConnect($host, $username, $password, $database);

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet</title>
<!-- InstanceEndEditable -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
</head>
<body style="margin:0px; background-image:url(images/bg_2008-08-21.2.gif)" id="main_body">
<?php 

include('inc/template_top.php');
?>
<table width="100%" border="0" cellpadding="0" cellspacing="0">
	<tr>
		<td width="160" valign="top" style="min-width:160px">
<?php 
include('inc/template_left.php');
?>
		</td>
		<td valign="top">
		<div style="margin:6px 10px 16px 10px; border-top:2px #4A2F65 solid">
		<!-- InstanceBeginEditable name="Main" -->
		<h3 align="center">Statistics		</h3>
<?php
$strSql="(SELECT distinct genesymbol1 as linked_gene FROM t_sentence_hit_gene2gene where genesymbol2='ifng') UNION (SELECT distinct genesymbol2 as linked_gene FROM t_sentence_hit_gene2gene where genesymbol1='ifng');";
$rs=$db->Execute($strSql);
$num_genes=$rs->RecordCount();

$strSql="(SELECT distinct concat(genesymbol1, '__', genesymbol2) as pair FROM t_sentence_hit_gene2gene where in_ifng_network=1) UNION (SELECT distinct concat(genesymbol2, '__', genesymbol1) as pair FROM t_sentence_hit_gene2gene where in_ifng_network=1);";
$rs=$db->Execute($strSql);
$num_pairs=$rs->RecordCount();


$strSql="SELECT count(distinct sentenceID) as num_sentences FROM t_sentence_hit_gene2gene where in_ifng_network=1;";
$rs=$db->Execute($strSql);
$num_sentences=$rs->Fields('num_sentences');


$strSql="SELECT * FROM t_centrality_score_dignet order by score_type, score desc;";
$rs=$db->Execute($strSql);
$array_rank=array();
foreach($rs as $row) {
 	if (!isset($array_rank[$row['score_type']]) || !is_array($array_rank[$row['score_type']])) { $array_rank[$row['score_type']] = array(); }
	if ( !in_array($row['genesymbol'], (array)($array_rank[$row['score_type']] ?? []), true) ) {
		$array_rank[$row['score_type']][]=$row['genesymbol'];
	}
}

//Bin --
$strSql = "SELECT count(distinct PMID) as pmidCount FROM t_sentence_hit_gene2gene;";
$rs = $db -> Execute($strSql);
$pmidCount = $rs -> Fields("pmidCount");

$strSql = "SELECT count(distinct sentenceID) as sentenceCount FROM t_sentence_hit_gene2gene;";
$rs = $db -> Execute($strSql);
$sentenceCount = $rs -> Fields("sentenceCount");

$strSql = "SELECT count(*) as interactionCount FROM t_sentence_hit_gene2gene;";
$rs = $db -> Execute($strSql);
$interactionCount = $rs -> Fields("interactionCount");

$strSql = "
	SELECT count(distinct newTable.gene) as geneCount
	FROM
	(
		SELECT geneSymbol1 as gene FROM t_sentence_hit_gene2gene
		UNION
		SELECT geneSymbol2 as gene FROM t_sentence_hit_gene2gene
	) newTable
	WHERE newTable.gene is not null;
";
$rs = $db -> Execute($strSql);
$geneCount = $rs -> Fields("geneCount");

?>

		<p>Ignet has analyzed abstracts from millions of publications available in PubMed.</p>		
	
		<p>Specifically, Ignet has found <?php echo htmlspecialchars($interactionCount, ENT_QUOTES, 'UTF-8') ?> gene-gene interactions from <?php echo htmlspecialchars($sentenceCount, ENT_QUOTES, 'UTF-8') ?> sentences in  <?php  echo htmlspecialchars($pmidCount, ENT_QUOTES, 'UTF-8')?> PubMed publications. These interactions involve <?php echo htmlspecialchars($geneCount, ENT_QUOTES, 'UTF-8') ?> unique human genes. </p>
		<br/>
		<p>An example listed for gene interaction with IFNG:</p> 
		<p><?php echo htmlspecialchars($num_genes, ENT_QUOTES, 'UTF-8')?> genes associated with IFNG,</p>
		<!-- <p><?php echo $num_pairs?> interactions detected in the IFNG interaction network. </p> -->
		<!-- <p><?php echo $num_sentences?> interaction sentences have been found and visualized in Ignet.</p> -->
		<p>Top 50 genes ranked by four scores</p>

<table border="1">
  <tr>
    <td>Rank</td>
    <td>Degree centrality</td>
    <td>Eigenvector centrality</td>
    <td>Closeness centrality</td>
    <td>Betweenness centrality</td>
  </tr>
<?php 
for ($i=0; $i<50; $i++) {
?>
  <tr>
    <td><?php echo $i+1?></td>
    <td><?php echo htmlspecialchars($array_rank['d'][$i], ENT_QUOTES, 'UTF-8')?></td>
    <td><?php echo htmlspecialchars($array_rank['p'][$i], ENT_QUOTES, 'UTF-8')?></td>
    <td><?php echo htmlspecialchars($array_rank['c'][$i], ENT_QUOTES, 'UTF-8')?></td>
    <td><?php echo htmlspecialchars($array_rank['b'][$i], ENT_QUOTES, 'UTF-8')?></td>
  </tr>
<?php 
}
?>
</table>

		<!-- InstanceEndEditable -->
		</div>
		</td>
	</tr>
</table>
</body>
<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
var pageTracker = _gat._getTracker("UA-4869243-4");
pageTracker._trackPageview();
</script>
<!-- InstanceEnd --></html>
