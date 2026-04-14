<!DOCTYPE html>
<html lang="en"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet</title>
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
<!-- <script type="text/javascript" src="cytoscapeweb_v1.0.2/js/min/AC_OETags.min.js"></script>	-->
<!-- <script type="text/javascript" src="cytoscapeweb_v1.0.2/js/min/json2.min.js"></script> -->
<!-- <script type="text/javascript" src="cytoscapeweb_v1.0.2/js/min/cytoscapeweb.min.js"></script> -->
<script	type="text/javascript" src="cytoscapeweb_v3.5.4/cytoscape.min.js"></script>

<!-- InstanceEndEditable -->
</head>
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
include('../inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">
  <!-- InstanceBeginEditable name="Main" -->
<h3>Dignet Gene Interaction Network Display</h3>

<?php
include('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);

$c_query_id = $vali->getInput('c_query_id', 'Query ID', 2, 60);


$strSql = "SELECT * FROM t_pubmed_query where c_query_id = " . $db->qstr($c_query_id);
$rs = $db->Execute($strSql);
if (!$rs->EOF) {
	$pubmedRecords=$rs->Fields('c_pubmed_records');
	$keywords = $rs->Fields('c_query_text');

	$safePmids = implode(',', array_map('intval', explode(',', $pubmedRecords)));
	$strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene_Host where pmid in ($safePmids)";

	$pairs=array();
	$arrayNode=array();

	$rs = $db->Execute($strSql);
	$node_id = 0;
	foreach ($rs as $row) {
		if (!isset($pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]) && !isset($pairs[$row['geneSymbol2']."\t".$row['geneSymbol1']])) $pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]=1;

		$node_id++;
		$arrayNode[$row['geneSymbol1']]=$node_id;
		$node_id++;
		$arrayNode[$row['geneSymbol2']]=$node_id;
	}

	$gml_txt = "
<graphml>
	<key id=\"label\" for=\"all\" attr.name=\"label\" attr.type=\"string\"/>
	<graph edgedefault=\"undirected\">
";

	foreach ($arrayNode as $node => $node_id) {
			$gml_txt .= "
		<node id=\"$node_id\">
			<data key=\"label\">$node</data>
		</node>
";
	}


	foreach ($pairs as $pair=>$tmpValue) {
		$tokens = preg_split('/\t/', $pair);

		$gml_txt .= "
		<edge source=\"{$arrayNode[$tokens[0]]}\" target=\"{$arrayNode[$tokens[1]]}\"	/>
";
	}

	$gml_txt .= "
	</graph>
</graphml>";

	$cy_element = '';

	foreach( $arrayNode as $node => $node_id ) {
		$cy_element .= "
		{
			data: {
				id: '$node_id',
				label: '$node',
			},
		},";
	}

	foreach( $pairs as $pair => $tmpValue ) {
		$tokens = preg_split( '/\t/', $pair );
		$cy_element .= "
		{
			data: {
				source: '{$arrayNode[$tokens[0]]}',
				target: '{$arrayNode[$tokens[1]]}',
			},
		},";
	}
}


?>
<p> Keywords: <?php echo htmlspecialchars($keywords, ENT_QUOTES, 'UTF-8')?>.</p>
<p> Found <a href="searchPubmed.php?keywords=<?php echo urlencode($keywords)?>"><?php echo sizeof($pairs)?> gene pairs</a>. Below are the network shown in Cytoscape Web.</p>
<p><a href="getNetworkGraphml.php?c_query_id=<?php echo urlencode($c_query_id)?>">Download network in graphml format</a>.</p>


<div id="cytoWebContent" style="width: 800px;height: 600px;display: block;"></div>

<!--
<script type="text/javascript">
    var options = { swfPath: "cytoscapeweb_v1.0.2/swf/CytoscapeWeb",
                    flashInstallerPath: "cytoscapeweb_v1.0.2/swf/playerProductInstall",
                    flashAlternateContent: "Flash Player needed." };

    var vis = new org.cytoscapeweb.Visualization("cytoWebContent", options);

    vis.draw({ network: '<?php echo preg_replace('/[\r\n]+/', "\\\r\n", $gml_txt)?>' });
</script>
-->
<script type="text/javascript">
	var cy = cytoscape({
		container: document.getElementById( 'cytoWebContent' ),
		elements: [<?php echo $cy_element;?>],
		style:[{
			"selector": "node",
			"style": {
				"content": "data(label)",
			},
		}],
	});
	var layout = cy.layout({name:'cose'});
	layout.run();
</script>

<?php
//	print("<pre>$gml_txt</pre>");
?>

  <!-- InstanceEndEditable -->
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
