<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet</title>
<!-- InstanceEndEditable -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="../../css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" -->
<!-- InstanceEndEditable -->
</head>
<body style="margin:0px; background-image:url(/images/bg_2008-08-21.2.gif)" id="main_body">
<?php 

include('../../inc/template_top.php');
?>
<table width="100%" border="0" cellpadding="0" cellspacing="0">
	<tr>
		<td width="160" valign="top" style="min-width:160px">
<?php 
include('../../inc/template_left.php');
?>
		</td>
		<td valign="top">
		<div style="margin:6px 10px 16px 10px; border-top:2px #4A2F65 solid">
		<!-- InstanceBeginEditable name="Main" -->
<h3>List of adverse event queries</h3>

<?php 
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$strSql = "SELECT * FROM t_pubmed_query where c_project_id = 'Cardiotoxicity' order by c_query_text";
$rs = $db->Execute($strSql);
?>
<table border="0" cellpadding="2" cellspacing="2">
  <tr>
    <td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">#</td>
    <td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Adverse Event</td>
    <td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"># of associated PMIDs</td>
    <td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"># of unique genes in the network</td>
    <td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"># of gene-pairs in the network</td>
    <td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">network</td>
    <td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">centrality scores</td>
    </tr>

<?php
$i=0;
foreach ($rs as $row) {
	$i++;
	
	
?>
  <tr>
    <td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $i?></td>
    <td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $row['c_query_text']?></td>
    <td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $row['c_num_pubmed_records']?></td>
    <td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $row['c_num_genes']?></td>
    <td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $row['c_num_pairs']?></td>
    <td bgcolor="#F5FAF7" style=" font-size:12px">
<?php
	if ($row['c_num_pairs']>0) {
?>
    <a href="../displayNetwork.php?c_query_id=<?php echo $row['c_query_id']?>">show</a>
<?php 
	}
	else {
?>
    
<?php 
	}
?>
    
        
</td>
    <td bgcolor="#F5FAF7" style=" font-size:12px">
<?php
	if ($row['c_num_pairs']>0) {
?>
    <a href="../loadScoresPubmed.php?c_query_id=<?php echo $row['c_query_id']?>">show</a>
<?php 
	}
	else {
?>
    
<?php 
	}
?>
    </td>
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
