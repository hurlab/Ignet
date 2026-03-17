<?php 
include('inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);
?>
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
<link href="css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
</head>
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
include('inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">
  <!-- InstanceBeginEditable name="Main" -->
<?php 

$vali=new Validation($_REQUEST);

$keywords = $vali->getInput('keywords', 'Keywords', 2, 60);

$tkeywords = transformKeywords($keywords);

?>

<h3> Gene Interaction Search</h3>

<?php 
$strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene where MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE) LIMIT 10000";

$gene_pairs=array();

$rs = $db->Execute($strSql);
foreach ($rs as $row) {
	if (!isset($gene_pairs[$row['geneSymbol1'].'---'.$row['geneSymbol2']]) && !isset($gene_pairs[$row['geneSymbol2'].'---'.$row['geneSymbol1']])) $gene_pairs[$row['geneSymbol1'].'---'.$row['geneSymbol2']]=1;
}

if (!empty($gene_pairs)){
?>

<p> Found <?php echo sizeof($gene_pairs)?> gene pairs.  <a href="dignet/load_centrality_scores.php?keywords=<?php echo htmlspecialchars(urlencode($keywords), ENT_QUOTES, 'UTF-8')?>">Calculate centrality scores</a>.</p>
<?php if (sizeof($gene_pairs) >= 10000): ?>
<p style="color:#888; font-size:0.9em;">Note: Results are limited to the top 10,000 database rows. Refine your keywords to see more specific results.</p>
<?php endif; ?>
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
</main>
<?php include('inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
