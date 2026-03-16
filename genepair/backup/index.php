<?php 
include('../inc/functions.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet GenePair</title>
<!-- InstanceEndEditable -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="../css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" -->
<script language="javascript" src="https://ajax.googleapis.com/ajax/libs/dojo/1.6.2/dojo/dojo.xd.js"
			djConfig="parseOnLoad: true"></script>
<script language="javascript" type="text/javascript">
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dojo.parser");
</script>
<style type="text/css">
	@import "http://ajax.googleapis.com/ajax/libs/dojo/1.3/dijit/themes/tundra/tundra.css";
</style>

<!-- InstanceEndEditable -->
</head>
<body style="margin:0px; background-image:url(../images/bg_2008-08-21.2.gif)" id="main_body">
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
$strSql="SELECT distinct geneSymbol1 FROM t_sentence_hit_gene2gene order by geneSymbol1";
$rs = $db->Execute($strSql);
foreach($rs as $row) {
	$geneSymbols[$row['geneSymbol1']] = 1;
}
$rs->close();

$strSql="SELECT distinct geneSymbol2 FROM t_sentence_hit_gene2gene order by geneSymbol1";
$rs = $db->Execute($strSql);
foreach($rs as $row) {
	$geneSymbols[$row['geneSymbol2']] = 1;
}
$rs->close();

ksort($geneSymbols);

if (isset($geneSymbols[$geneSymbol1]) && isset($geneSymbols[$geneSymbol2]) ) {
	$gene_found=true;
}
?>

<script language="JavaScript" type="text/javascript">
function reloadDiv(divID, url) {
	divID.setHref(url);
	return false;
}


function reloadGenes() {
	var geneSymbol1 = document.getElementById("geneSymbol1").value;
	var hasVaccine = document.getElementById("hasVaccine").value;
	var element_to_change=document.getElementById("geneSymbol2");

	var kw = {
			url: 'get_genes.php?geneSymbol1=' + geneSymbol1 + '&hasVaccine=' + hasVaccine,
			handleAs: 'json',
			load: function(data){
				element_to_change.options.length=data.length;
				for(var i in data) {
					element_to_change.options[i].value=data[i];
					element_to_change.options[i].text=data[i];
				}
			},
			error: function(data){
				alert("An error occurred: " + data);
			},
			timeout: 5000
	};
	dojo.xhrGet(kw);
}

String.prototype.trim = function () {
	return this.replace(/^\s*/, "").replace(/\s*$/, "");
}


String.prototype.htmlspecialchars_decode = function () {
	return this.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

//require dojo 0.9.0
function retrive_dist() {
	var geneSymbol1 = document.getElementById("geneSymbol1").value;
	var geneSymbol2 = document.getElementById("geneSymbol2").value;
	var hasVaccine = document.getElementById("hasVaccine").value;
	var keywords = document.getElementById("keywords").value;

	if (geneSymbol1.trim()=="" || geneSymbol2.trim()=="") {
		alert("Please select a pair of genes!");
	}
	else {
		document.getElementById('div_results2').style.display='';
		div_results2.setHref("../genepair/list.php?geneSymbol1=" + geneSymbol1 + "&geneSymbol2=" + geneSymbol2 + "&hasVaccine=" + hasVaccine + "&keywords=" + keywords);
	}
}


<?php 
if ($gene_found) {
?>
	dojo.addOnLoad(retrive_dist);
<?php 	
}
?>
</script>
<h3 align="center">Ignet GenePair Query</h3>
  <form id="form1" name="form1">
  <input type="hidden" name="hasVaccine" id="hasVaccine"  value=""/>
  	<table border="0" style="border:1px solid #666666">
		<tr>
			<td class="styleLeftColumn">Gene1</td>
			<td class="tdData">
	  <select name="geneSymbol1" id="geneSymbol1" onchange="reloadGenes();">
          <?php 
foreach ($geneSymbols as $gene=>$tmp) { 
?>
          <option value="<?php echo $gene?>" <?php  if ($gene==$geneSymbol1){?> selected="selected" <?php  }?>>
          <?php echo $gene?>
          </option>
          <?php 
}
?>
        </select>			
			</td>
			<td class="styleLeftColumn">Gene2</td>
			<td class="tdData">
	  <select name="geneSymbol2" id="geneSymbol2">
          <?php 
foreach ($geneSymbols as $gene=>$tmp) { 
?>
          <option value="<?php echo $gene?>" <?php  if ($gene==$geneSymbol2){?> selected="selected" <?php  }?>>
          <?php echo $gene?>
          </option>
          <?php 
}
?>
        </select>			
			</td>
			<td class="tdData">Keywords: </td>
			<td class="tdData"><label for="keywords"></label>
			  <input type="text" name="keywords" id="keywords" value="<?php echo $keywords?>" /></td>
			<td align="center" class="tdData"><input name="Button" type="button" value="Search" onclick="retrive_dist()" /></td>
		</tr>
	</table>
		</form>
	
<div jsId="div_results2" id="div_results2" dojotype="dijit.layout.ContentPane" loadingmessage="Loading Publications..."></div>	
		
<p>For example, Search for: 
	<ul>
	<li>Interactions between <a href="http://134.129.166.26/ignet/genepair/index.php?geneSymbol1=IL6&geneSymbol2=IFNG"> IL6 and IFNG</a>, or between <a href="http://134.129.166.26/ignet/genepair/index.php?hasVaccine=&geneSymbol1=IL6&geneSymbol2=IFNG&keywords=blood"> IL6 and IFNG with keyword "blood"</a>. </li> 
	<li>Interactions between <a href="http://134.129.166.26/ignet/genepair/index.php?geneSymbol1=TLR4&geneSymbol2=TNF"> TLR4 and TNF</a>, between <a href="http://134.129.166.26/ignet/genepair/index.php?geneSymbol1=TLR4&geneSymbol2=IL10"> TLR4 and IL10</a>, or between <a href="http://134.129.166.26/ignet/genepair/index.php?geneSymbol1=TLR4&geneSymbol2=IFNG"> TLR4 and IFNG</a>.</li> 
	</ul>			
</p>
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
