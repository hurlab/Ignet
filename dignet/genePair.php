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
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
</head>
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
include('../inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">
  <!-- InstanceBeginEditable name="Main" -->
<h3>Gene Pair Information</h3>

<?php
include('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);

$c_query_id = $vali->getInput('c_query_id', 'Query ID', 2, 60);
$geneSymbol1 = $vali->getInput('geneSymbol1', 'Gene Name', 1, 60, true);
$geneSymbol2 = $vali->getInput('geneSymbol2', 'Gene Name', 1, 60, true);


$strSql = "SELECT * FROM t_pubmed_query where c_query_id = " . $db->qstr($c_query_id);
$rs = $db->Execute($strSql);

if (!$rs->EOF) {
	$pubmedRecords=$rs->Fields('c_pubmed_records');
	$safePmids = implode(',', array_map('intval', explode(',', $pubmedRecords)));
	$qGeneSymbol1 = $db->qstr($geneSymbol1);
	$qGeneSymbol2 = $db->qstr($geneSymbol2);
	$strSql="SELECT distinct s24.sentence, s24.PMID FROM sentences25_genepair s24 INNER JOIN t_sentence_hit_gene2gene_Host hgh ON hgh.PMID = s24.PMID where hgh.PMID in ($safePmids) and ((geneSymbol1 = $qGeneSymbol1 and  geneSymbol2 = $qGeneSymbol2) OR  (geneSymbol1 = $qGeneSymbol2 and  geneSymbol2 = $qGeneSymbol1))";

	$rs = $db->Execute($strSql);
	$array_pub_list = $rs->GetArray();

?>

<p>Gene Pair: <?php echo htmlspecialchars($geneSymbol1, ENT_QUOTES, 'UTF-8')?>, <?php echo htmlspecialchars($geneSymbol2, ENT_QUOTES, 'UTF-8')?></p>
<p>Related Sentences</p>

<table border="0" cellpadding="4">
  <tr>
    <td align="center" bgcolor="#E4E4E4" class="styleLeftColumn">#</td>
    <td align="center" bgcolor="#E4E4E4" class="styleLeftColumn">PMID</td>
    <td align="center" bgcolor="#E4E4E4" class="styleLeftColumn">Sentence</td>
  </tr>
<?php
	$i=0;
	foreach ($array_pub_list as $row) {
		$i++;
?>
  <tr>
    <td valign="top" bgcolor="#F4F9FD" class="smallContent"><b><?php echo $i?></b></td>
    <td valign="top" bgcolor="#F4F9FD" class="smallContent">
<a href="http://www.ncbi.nlm.nih.gov/pubmed/<?php echo (int)$row['PMID']?>" target="_blank"><?php echo (int)$row['PMID']?></a>
	</td>
    <td valign="top" bgcolor="#F4F9FD" class="smallContent">
<?php
 if ($keywords!='') {
		echo(formatOutput($row['sentence'], array($keywords)));
}
else {
	echo htmlspecialchars($row['sentence'], ENT_QUOTES, 'UTF-8');
}
?>
    </td>
  </tr>
<?php
	}
?>
</table>
<?php

}
?>

  <!-- InstanceEndEditable -->
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
