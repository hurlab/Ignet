<?php
include('../inc/functions.php');

function debug_to_console($data){
    $outpout = $data;
    if (is_array($output))
        $output = implode(',', $output);

    echo "<script>console.log(".$output.");</script>";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<title>Ignet Gene</title>
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
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
include('../inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">
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
    <h2 class="text-lg font-bold text-[#1a365d] text-center mb-4">Gene Query</h2>
    <form onsubmit="retrive_dist(); return false;" class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div class="flex flex-wrap items-end gap-3">
        <div>
          <label for="geneSymbol1" class="block text-xs font-semibold text-gray-600 mb-1">Gene</label>
          <select name="geneSymbol1" id="geneSymbol1" class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none">
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
          <label for="score" class="block text-xs font-semibold text-gray-600 mb-1">Score >=</label>
          <input type="text" name="score" id="score" value="<?php echo $score;?>" class="border border-gray-300 rounded px-2 py-1.5 text-sm w-20 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
        </div>
        <div>
          <label for="hasVaccine" class="block text-xs font-semibold text-gray-600 mb-1">Vaccine</label>
          <select name="hasVaccine" id="hasVaccine" class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none">
            <option value='1' <?php if ($hasVaccine=='1') echo 'selected';?>>Required</option>
            <option value='0' <?php if ($hasVaccine!='1') echo 'selected';?>>Optional</option>
          </select>
        </div>
        <div>
          <label for="keywords" class="block text-xs font-semibold text-gray-600 mb-1">Keywords</label>
          <input type="text" name="keywords" id="keywords" value="<?php echo $keywords?>" placeholder="e.g., blood" class="border border-gray-300 rounded px-2 py-1.5 text-sm w-32 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
        </div>
        <div>
          <button type="button" name="Button" onclick="retrive_dist();" class="bg-[#ed8936] hover:bg-orange-500 text-white px-4 py-1.5 rounded text-sm font-medium transition">Retrieve</button>
        </div>
      </div>
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

</main>
<?php include('../inc/template_footer.php'); ?>
</body>
</html>
