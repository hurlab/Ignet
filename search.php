<?php 
include('inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);
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
<body style="margin:0px; background-image:url(/images/bg_2008-08-21.2.gif)" id="main_body">
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
<?php 

$vali=new Validation($_REQUEST);

$keywords = $vali->getInput('keywords', 'Keywords', 2, 60);

$tkeywords = transformKeywords($keywords);

?>

<h3> Gene Interaction Search</h3>

<?php 
$strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";

$gene_pairs=array();

$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	if (!isset($gene_pairs[$row['geneSymbol1'].'---'.$row['geneSymbol2']]) && !isset($gene_pairs[$row['geneSymbol2'].'---'.$row['geneSymbol1']])) $gene_pairs[$row['geneSymbol1'].'---'.$row['geneSymbol2']]=1;
}

if (!empty($gene_pairs)){
?>

<p> Found <?php echo sizeof($gene_pairs)?> gene pairs.  <a href="dignet/load_centrality_scores.php?keywords=<?php echo htmlspecialchars(urlencode($keywords), ENT_QUOTES, 'UTF-8')?>">Calculate centrality scores</a>.</p>
<table border="0" cellpadding="2" cellspacing="2">
  <tr>
	<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Gene 1</td>
	<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Gene 2</td>
  </tr>
<?php 
	foreach ($gene_pairs as $gene_pair=>$tmp) {
		$tokens=preg_split('/---/', $gene_pair);
?>
  <tr>
	<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($tokens[0], ENT_QUOTES, 'UTF-8')?></td>
	<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($tokens[1], ENT_QUOTES, 'UTF-8')?></td>
  </tr>
<?php 
	}
?>
</table>
<?php 
}
else {
?>
<p align="center">No protein/gene was found.</p>
<?php 
}
?>

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
