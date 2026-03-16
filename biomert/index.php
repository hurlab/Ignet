<?php 
include('../inc/functions.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>BioMert</title>
<!-- InstanceEndEditable -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="../css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" -->
	
<!-- InstanceEndEditable -->
</head>
<body style="margin:0px; background-image:url(/images/bg_2008-08-21.2.gif)" id="main_body">
<?php 

include('../inc/template_top.php');
?>
<table width="100%" border="0" cellpadding="0" cellspacing="0">
	<tr>
		<td width="160" valign="top" style="min-width:160px">
<?php 
include('../inc/template_left.php');
?>
		</td>
		<td valign="top">
		<div style="margin:6px 10px 16px 10px; border-top:2px #4A2F65 solid">
		<!-- InstanceBeginEditable name="Main" -->
    <?php 

$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);
$vali=new Validation($_REQUEST);
			
$geneSymbol1 = $vali->getInput('geneSymbol1', 'Gene Name 1', 0, 50, true);
$geneSymbol2 = $vali->getInput('geneSymbol2', 'Gene Name 2', 0, 50, true);
$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);

$gene_found=false;

$geneSymbols =  array();
$strSql="SELECT distinct geneSymbol1 FROM t_sentence_hit_gene2gene_Host order by geneSymbol1";
$rs = $db->Execute($strSql);
foreach($rs as $row) {
	$geneSymbols[$row['geneSymbol1']] = 1;
}
$rs->close();

?>

</script>
			
<h3 align="center">BioMert: BioMedical Bert NLP of Gene-gene Interactions</h3>

			<p>Description here: BioMert is a web program that ... </p>
		
    <form action="biomert_proc.php" enctype="multipart/form-data" method="post" id="biomert_query_id" >
				
<table border="0">
  <tr>
    <td> 
		<span style="margin-left:32px;"><strong>Enter or paste text:</strong></span><br/><br/> 
	
		<textarea name="querytext" cols="100" rows="20" id="querytext" style="margin-left:32px"></textarea><br/><br/>

	  </td>	 

  </tr>
		
  <tr>
    <td> (<em>Examples:</em> abstract xyz...)</td>
  </tr>
		
  <tr>
    <td align="center" style="padding-top:12px">&nbsp;&nbsp;&nbsp;&nbsp; 
      <input type="submit" name="submit" id="submit" value="Search" onClick="submitForm();" />  <!--Oliver note: deleted: name="Submit", good. -->
      <input type="reset" name="Reset" value="Clear" />
		(<a href="query_help.php" class="style2">Search Help</a>)
	</td>
  </tr>  
</table>
</form>
			
		
<p><em><strong>Note:</strong></em> This program is currently under active development. </p>
			<br/>
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
