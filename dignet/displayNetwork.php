<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet</title>
<!-- InstanceEndEditable -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="../css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" -->
<!-- <script type="text/javascript" src="cytoscapeweb_v1.0.2/js/min/AC_OETags.min.js"></script>	-->
<!-- <script type="text/javascript" src="cytoscapeweb_v1.0.2/js/min/json2.min.js"></script> -->
<!-- <script type="text/javascript" src="cytoscapeweb_v1.0.2/js/min/cytoscapeweb.min.js"></script> -->
<script	type="text/javascript" src="cytoscapeweb_v3.5.4/cytoscape.min.js"></script>


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
<h3>Dignet Gene Interaction Network Display</h3>

<?php 
include('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);

$c_query_id = $vali->getInput('c_query_id', 'Query ID', 2, 60);


$strSql = "SELECT * FROM t_pubmed_query where c_query_id = '$c_query_id'";
$rs = $db->Execute($strSql);
if (!$rs->EOF) {
	$pubmedRecords=$rs->Fields('c_pubmed_records');
	$keywords = $rs->Fields('c_query_text');
	
	$strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene_Host where pmid in ($pubmedRecords)";
	
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
<p> Keywords: <?php echo $keywords?>.</p>
<p> Found <a href="searchPubmed.php?keywords=<?php echo $keywords?>"><?php echo sizeof($pairs)?> gene pairs</a>. Below are the network shown in Cytoscape Web.</p>
<p><a href="getNetworkGraphml.php?c_query_id=<?php echo $c_query_id?>">Download network in graphml format</a>.</p>


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
		</div>
		</td>
	</tr>
</table>
</body>
<!--
<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
var pageTracker = _gat._getTracker("UA-4869243-4");
pageTracker._trackPageview();
</script>
-->
<!-- InstanceEnd --></html>
