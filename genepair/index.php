<?php
include('../inc/functions.php');
?>
<!DOCTYPE html>
<html lang="en"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet GenePair</title>
<!-- InstanceEndEditable -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          navy: '#1a365d',
          'navy-dark': '#102a4c',
          accent: '#ed8936',
          success: '#38a169',
          background: '#f7fafc',
          text: '#1a202c',
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        },
      }
    }
  }
</script>
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
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
include('../inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">
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

$strSql="SELECT distinct geneSymbol2 FROM t_sentence_hit_gene2gene_Host order by geneSymbol2";
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

        alert(kw);

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
<h2 class="text-lg font-bold text-[#1a365d] text-center mb-4">GenePair Query</h2>
  <form id="form1" name="form1" class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
  <input type="hidden" name="hasVaccine" id="hasVaccine" value=""/>
    <div class="flex flex-wrap items-end gap-3">
      <div>
        <label for="geneSymbol1" class="block text-xs font-semibold text-gray-600 mb-1">Gene 1</label>
        <select name="geneSymbol1" id="geneSymbol1" onchange="reloadGenes();" class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none">
          <?php
foreach ($geneSymbols as $gene=>$tmp) {
?>
          <option value="<?php echo $gene?>" <?php if ($gene==$geneSymbol1){?> selected="selected" <?php }?>><?php echo $gene?></option>
          <?php
}
?>
        </select>
      </div>
      <div>
        <label for="geneSymbol2" class="block text-xs font-semibold text-gray-600 mb-1">Gene 2</label>
        <select name="geneSymbol2" id="geneSymbol2" class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none">
          <?php
foreach ($geneSymbols as $gene=>$tmp) {
?>
          <option value="<?php echo $gene?>" <?php if ($gene==$geneSymbol2){?> selected="selected" <?php }?>><?php echo $gene?></option>
          <?php
}
?>
        </select>
      </div>
      <div>
        <label for="keywords" class="block text-xs font-semibold text-gray-600 mb-1">Keywords</label>
        <input type="text" name="keywords" id="keywords" value="<?php echo $keywords?>" placeholder="e.g., blood" class="border border-gray-300 rounded px-2 py-1.5 text-sm w-32 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
      </div>
      <div>
        <button name="Button" type="button" onclick="retrive_dist()" class="bg-[#ed8936] hover:bg-orange-500 text-white px-4 py-1.5 rounded text-sm font-medium transition">Search</button>
      </div>
    </div>
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
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
