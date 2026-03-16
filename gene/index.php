<?php 
include('../inc/functions.php');

function debug_to_console($data){
    $outpout = $data;
    if (is_array($output))
        $output = implode(',', $output);
    
    echo "<script>console.log(".$output.");</script>";
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head>
<title>Ignet Gene</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="../css/bmain.css" rel="stylesheet" type="text/css" />
<script language="javascript" src="https://ajax.googleapis.com/ajax/libs/dojo/1.6.2/dojo/dojo.xd.js"
			djConfig="parseOnLoad: true"></script>
<script language="javascript" type="text/javascript">
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dojo.parser");

function reloadGenes() {
	var hasVaccine = document.getElementById("hasVaccine").value;
	var element_to_change=document.getElementById("geneSymbol1");

	var kw = {
			url: 'get_genes.php?hasVaccine=' + hasVaccine,
			handleAs: 'json',
			load: function(data){
				element_to_change.options.length=data.length;
				for(var i in data) {
					element_to_change.options[i]=new Option(data[i], data[i]);
				}
			},
			error: function(data){
				alert("An error occurred: " + data);
			},
			timeout: 5000
	};
	dojo.xhrGet(kw);
}

</script>
<style type="text/css">
	@import "https://ajax.googleapis.com/ajax/libs/dojo/1.3/dijit/themes/tundra/tundra.css";
</style>
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
		<?php 
$db = NewADOConnection($driver);
$db->PConnect($host, $username, $password, $database);
$vali=new Validation($_REQUEST);
$geneSymbol1 = $vali->getInput('geneSymbol1', 'Gene Name', 0, 50, true);
$score = $vali->getInput('score', 'Score', 0, 60, true);
$hasVaccine = $vali->getInput('hasVaccine', '"Vaccine" metioned?', 0, 60, true);
$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);

$gene_found=false;

$geneSymbols =  array();
// --- SQL INJECTION VULNERABILITY STILL EXISTS HERE ---
$strSql="SELECT c_genesymbol FROM t_gene_list WHERE c_score='y' order by c_genesymbol";
$rs = $db->Execute($strSql);
foreach($rs as $row) {
	$geneSymbols[$row['c_genesymbol']] = 1;
}
$rs->close();

if (isset($geneSymbols[$geneSymbol1])) {
	$gene_found=true;
}
?>

<script language="JavaScript" type="text/javascript">
function togglePub(divID) {
	document.getElementById(divID).style.display = document.getElementById(divID).style.display == 'none' ? '' : 'none';
}

function reloadDiv(divID, url) {
	divID.setHref(url);
	return false;
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
	var score = document.getElementById("score").value;
	var hasVaccine = document.getElementById("hasVaccine").value;
	var keywords = document.getElementById("keywords").value;

	if (geneSymbol1.trim()=="") {
		alert("Please select a gene!");
		return;
	}

	// Show loading messages and clear old results
	document.getElementById('div_results1').style.display='';
	document.getElementById('div_results2').style.display='';
	div_results1.setHref("getRelatedGenes.php?geneSymbol1=" + geneSymbol1 + "&score=" + score + "&hasVaccine=" + hasVaccine + "&keywords=" + keywords);
	div_results2.setHref("showpubs.php?geneSymbol1=" + geneSymbol1 + "&score=" + score + "&hasVaccine=" + hasVaccine + "&keywords=" + keywords);
	document.getElementById('img001').src="../images/pixel.gif"; // Clear previous image
	document.getElementById('div_img001').innerHTML='<p><i>Generating network image...</i></p>'; // Show loading message
	document.getElementById('map001').innerHTML=''; // Clear old map

	dojo.xhrGet( {
		url: "do_layout.php?geneSymbol1=" + geneSymbol1 + "&score=" + score + "&hasVaccine=" + hasVaccine + "&keywords=" + keywords,
		handleAs: "text",
		timeout: 50000, // Time in milliseconds
		
		load: function(response, ioArgs) {
			// Check if the response contains an error message or a success message
			if (response.toLowerCase().indexOf("<p>") > -1) {
				// It's an error or info message from the PHP script, display it
				document.getElementById('div_img001').innerHTML = response;
				document.getElementById('img001').src="../images/pixel.gif"; // Hide image area
			} else {
				// It's the map data, so the image was created successfully
				document.getElementById('map001').innerHTML = response;
				document.getElementById('div_img001').innerHTML = ''; // Clear loading message
				// Set the image source, adding a random number to prevent browser caching
				document.getElementById('img001').src="../tmp/ignet/" + geneSymbol1.replace(/\W+/g, '_') + ".png?rand=" + Math.random();
			}
			return response; 
		},
		
		error: function(response, ioArgs) {
			console.error("HTTP status code: ", ioArgs.xhr.status);
			document.getElementById('div_img001').innerHTML = '<p><b>Request Failed:</b> Could not contact the server to generate the image. Please try again.</p>';
			return response;
		}
	});	
}

<?php 
if ($gene_found) {
?>
	dojo.addOnLoad(retrive_dist);
<?php 	
}
?>
</script>
    <h3 align="center">Ignet Gene Query</h3>
    <form onsubmit="retrive_dist(); return false;">
      <table border="0" cellpadding="4">
			<tr>
				<td bgcolor="#E4E4E4" class="styleLeftColumn">Gene Name </td>
				<td bgcolor="#F4F9FD">
	  <select name="geneSymbol1" id="geneSymbol1">
          <?php 
foreach ($geneSymbols as $gene=>$tmp) { 
?>
          <option value="<?php echo $gene?>" <?php  if ($gene==$geneSymbol1){?> selected="selected" <?php  }?>>
          <?php echo $gene?>
          </option>
          <?php 
}
?>
        </select>				</td>
				<td bgcolor="#E4E4E4" class="tdData">Score>= </td>
				<td class=tdData">
				  <input type="text" name="score" id="score" value="<?php echo $score;?>"/>
				</td>
				<td bgcolor="#E4E4E4" class="tdData">"Vaccine" metioned? </td>
				<td class="tdData">
				  <select name="hasVaccine" id="hasVaccine">
				    <option value='1' <?php if ($hasVaccine=='1') echo 'selected';?>>Required</option>
				    <option value='0' <?php if ($hasVaccine!='1') echo 'selected';?>>Optional</option>
				  </select>
				</td>
				<td class="tdData">Keywords: </td>
				<td class="tdData"><label for="keywords"></label>
				  <input type="text" name="keywords" id="keywords" value="<?php echo $keywords?>" /></td>
				<td align="center"><input type="button" name="Button" value="Retrieve" onclick="retrive_dist();" /></td>
				</tr>
		</table>
    </form>
      <br />
      <table border="0">
        <tr>
          <td valign="top">
		  <div jsId="div_results1" id="div_results1" dojotype="dijit.layout.ContentPane" loadingmessage="Loading related genes..." style="height:300px; overflow:auto; ">
<?php 
if ($geneSymbol1=='') {
?>
<p><strong>Instruction: </strong>Please select a gene, choose 'vaccine' required or not, add some keyword (optional), and then click retrieve!</p>
<p><strong>Examples:</strong> Choose and click: <a href="index.php?geneSymbol1=A1BG">A1BG</a>, <a href="index.php?geneSymbol1=IFNG">IFNG</a>, <a href="index.php?geneSymbol1=IL10">IL10</a>, <a href="index.php?geneSymbol1=SLC39A1">SLC39A1</a>, <a href="index.php?geneSymbol1=TLR4">TLR4</a>, <a href="index.php?geneSymbol1=TNF">TNF</a>. <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For each of the query, you can add the requirement of 'vaccine' mentioned, and/or you can add some keyword(s) such as 'blood'. 
</p>
<?php 
}
else {
	if (!$gene_found) {
?>
<p>&nbsp; </p>
<p>Can not find gene <?php echo $geneSymbol1?>! Please select a different gene and click retrive!</p>
<?php 
	}
}
?>
		  </div></td>
          <td>
<img src="../images/pixel.gif" name="img001" align="top" usemap="#map001" id="img001" border="0"/>
<map name="map001" id="map001">
</map>
<div id="div_img001"></div>
		  </td>
        </tr>
      </table>
      <table border="0">
        <tr>
          <td colspan="2"><div jsId="div_results2" id="div_results2" dojotype="dijit.layout.ContentPane" loadingmessage="Loading Publications..." style="height:300px; overflow:auto;"></div></td>
        </tr>
      </table>
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
</html>
