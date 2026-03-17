<?php
include ('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);
?>
<!DOCTYPE html>
<html lang="en"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>IGNET: Interferon-gamma (IFN-γ) Network</title>
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
    <?php

$vali=new Validation($_REQUEST);

//$keywords = $vali->getInput('keywords', 'Keywords', 2, 60);
$species = $vali->getInput('species', 'Genomes', 0, 100);
$phi_function = $vali->getInput('phi_function', 'Pathogen-Host Interaction', 0, 30);
$gene_locus_tag = $vali->getInput('gene_locus_tag', 'Locus Tag', 0, 60);
$gene_name = $vali->getInput('gene_name', 'Locus Name', 0, 60);
$gene_id = $vali->getNumber('gene_id', 'NCBI GeneID', 0, 60);
$gene_start = $vali->getInput('gene_start', 'Gene Position Start', 0, 60);
$gene_end = $vali->getInput('gene_end', 'Gene Position End', 0, 60);
$protein_refseq = $vali->getInput('protein_refseq', 'NCBI Protein RefSeq', 0, 60);
$protein_id = $vali->getNumber('protein_id', 'NCBI Protein GI', 0, 60);
$uniprot_acc = $vali->getInput('uniprot_acc', 'UniProt Accession No', 0, 60);
$protein_weight1 = $vali->getNumber('protein_weight1', 'Protein Weight Greater than', 0, 60);
$protein_weight2 = $vali->getNumber('protein_weight2', 'Protein Weight Less than', 0, 60);
$protein_pi1 = $vali->getNumber('protein_pi1', 'Protein pI Greater than', 0, 60);
$protein_pi2 = $vali->getNumber('protein_pi2', 'Protein pI Less than', 0, 60);
$description = $vali->getInput('description', 'Protein Description', 0, 60);
$orderby1 = $vali->getInput('orderby1', 'First Sort Order by', 0, 60);
$order1 = $vali->getInput('order1', 'First Sort Accending or Decending', 0, 60);
$orderby2 = $vali->getInput('orderby2', 'Second Sort Order by', 0, 60);
$order2 = $vali->getInput('order2', 'Second Sort Accending or Decending', 0, 60);
$currPage = $vali->getNumber('currPage', 'Current Page', 1, 5);

$strSql = "SELECT geneid FROM t_gene_annotation WHERE 1=1";

if ($species != '') {
	$strSql .= " AND species = " . $db->qstr($species);
}

if ($gene_locus_tag != '') {
	$strSql .= " AND locustag = " . $db->qstr($gene_locus_tag);
}
if ($gene_name != '') {
	$strSql .= " AND (symbol = " . $db->qstr($gene_name) . " OR MATCH (synonyms) AGAINST (" . $db->qstr($gene_name) . "))";
}
if ($gene_id != '') {
	$strSql .= " AND geneid = " . $db->qstr($gene_id);
}

if ($protein_refseq != '') {
	$strSql .= " AND (protein_acc=" . $db->qstr($protein_refseq) . " or protein_acc like " . $db->qstr($protein_refseq . '.%') . ") ";
}
if ($protein_id != '') {
	$strSql .= " AND protein_gi=" . $db->qstr($protein_id);
}
if ($uniprot_acc != '') {
	$strSql .= " AND uniprot_acc=" . $db->qstr($uniprot_acc);
}

if ($description != '') {
	$tkeywords = transformKeywords($description);
	$strSql .= " AND MATCH(symbol,locustag,synonyms,dbxrefs,description,protein_note,annotation,phi_annotation,taxname) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
}

// Build COUNT query using the same WHERE clause
$strSqlCount = "SELECT COUNT(*) FROM t_gene_annotation WHERE 1=1";

if ($species != '') {
	$strSqlCount .= " AND species = " . $db->qstr($species);
}
if ($gene_locus_tag != '') {
	$strSqlCount .= " AND locustag = " . $db->qstr($gene_locus_tag);
}
if ($gene_name != '') {
	$strSqlCount .= " AND (symbol = " . $db->qstr($gene_name) . " OR MATCH (synonyms) AGAINST (" . $db->qstr($gene_name) . "))";
}
if ($gene_id != '') {
	$strSqlCount .= " AND geneid = " . $db->qstr($gene_id);
}
if ($protein_refseq != '') {
	$strSqlCount .= " AND (protein_acc=" . $db->qstr($protein_refseq) . " or protein_acc like " . $db->qstr($protein_refseq . '.%') . ") ";
}
if ($protein_id != '') {
	$strSqlCount .= " AND protein_gi=" . $db->qstr($protein_id);
}
if ($uniprot_acc != '') {
	$strSqlCount .= " AND uniprot_acc=" . $db->qstr($uniprot_acc);
}
if ($description != '') {
	$tkeywords = transformKeywords($description);
	$strSqlCount .= " AND MATCH(symbol,locustag,synonyms,dbxrefs,description,protein_note,annotation,phi_annotation,taxname) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
}

$numOfRecords = (int)$db->GetOne($strSqlCount);

if ($numOfRecords > 0)
{
	$recordsPerPage = 50;
	$numOfPage = ceil($numOfRecords / $recordsPerPage);

	if ($currPage == '' || $currPage > $numOfPage || $numOfPage < 1) {
		$currPage = 1;
	}
	$params = "&species=" . urlencode($species) . "&phi_function=" . urlencode($phi_function) . "&gene_locus_tag=" . urlencode($gene_locus_tag) . "&gene_name=" . urlencode($gene_name) . "&gene_id=" . urlencode($gene_id) . "&gene_start=" . urlencode($gene_start) . "&gene_end=" . urlencode($gene_end) . "&protein_refseq=" . urlencode($protein_refseq) . "&protein_id=" . urlencode($protein_id) . "&uniprot_acc=" . urlencode($uniprot_acc) . "&protein_weight1=" . urlencode($protein_weight1) . "&protein_weight2=" . urlencode($protein_weight2) . "&protein_pi1=" . urlencode($protein_pi1) . "&protein_pi2=" . urlencode($protein_pi2) . "&description=" . urlencode($description) . "&orderby1=" . urlencode($orderby1) . "&order1=" . urlencode($order1) . "&orderby2=" . urlencode($orderby2) . "&order2=" . urlencode($order2);

	$offset = ($currPage - 1) * $recordsPerPage;

	$strSqlPage = "select * from t_gene_annotation where geneid in (SELECT geneid FROM t_gene_annotation WHERE 1=1";

	if ($species != '') {
		$strSqlPage .= " AND species = " . $db->qstr($species);
	}
	if ($gene_locus_tag != '') {
		$strSqlPage .= " AND locustag = " . $db->qstr($gene_locus_tag);
	}
	if ($gene_name != '') {
		$strSqlPage .= " AND (symbol = " . $db->qstr($gene_name) . " OR MATCH (synonyms) AGAINST (" . $db->qstr($gene_name) . "))";
	}
	if ($gene_id != '') {
		$strSqlPage .= " AND geneid = " . $db->qstr($gene_id);
	}
	if ($protein_refseq != '') {
		$strSqlPage .= " AND (protein_acc=" . $db->qstr($protein_refseq) . " or protein_acc like " . $db->qstr($protein_refseq . '.%') . ") ";
	}
	if ($protein_id != '') {
		$strSqlPage .= " AND protein_gi=" . $db->qstr($protein_id);
	}
	if ($uniprot_acc != '') {
		$strSqlPage .= " AND uniprot_acc=" . $db->qstr($uniprot_acc);
	}
	if ($description != '') {
		$strSqlPage .= " AND MATCH(symbol,locustag,synonyms,dbxrefs,description,protein_note,annotation,phi_annotation,taxname) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
	}
	$strSqlPage .= " LIMIT $recordsPerPage OFFSET $offset)";

	$rs = $db->Execute($strSqlPage);
	$array_gene = array();
	if ($rs && !$rs->EOF) {
		$array_gene = $rs->GetArray();
		$rs->close();
	}


?>
		<p> Found
			<?php echo $numOfRecords?>
			gene(s). Please click a gene name for related MeSH information. (Only genes which have siginicant MeSH information are clickable.) </p>
		<table border="0">
			<tr>
				<td bgcolor="#F5FAF7" class="tdData" style="padding-left:20px; padding-right:20px "><strong>Record:</strong>
						<?php echo (($currPage-1) * $recordsPerPage + 1)?>
					to
					<?php echo ($currPage * $recordsPerPage) < $numOfRecords? ($currPage * $recordsPerPage) :$numOfRecords?>
					of
					<?php echo $numOfRecords?>
					Records. </td>
				<td bgcolor="#F5FAF7" class="tdData" style="padding-left:20px; padding-right:20px "><strong>Page:</strong>
						<?php echo $currPage?>
					of
					<?php echo $numOfPage?>
					,
					<?php
	if ($currPage > 1) {
?>
					<a href="../genemesh/?currPage=1<?php echo $params?>">First</a>
					<?php
	}
	else {
?>
					First
					<?php
	}
?>
					,
					<?php
	if ($currPage > 1) {
?>
					<a href="../genemesh/?currPage=<?php echo $currPage-1?><?php echo $params?>">Previous </a>
					<?php
	}
	else {
?>
					Previous
					<?php
	}
?>
					,
					<?php
	if ($currPage < $numOfPage) {
?>
					<a href="../genemesh/?currPage=<?php echo $currPage+1?><?php echo $params?>">Next</a>
					<?php
	}
	else {
?>
					Next
					<?php
	}
?>
					,
					<?php
	if ($currPage < $numOfPage) {
?>
					<a href="../genemesh/?currPage=<?php echo $numOfPage?><?php echo $params?>">Last</a>
					<?php
	}
	else {
?>
					Last
					<?php
	}
?>				</td>
			</tr>
		</table>
		<table border="0" cellpadding="2" cellspacing="2">
			<tr>
				<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Speices</td>
				<td height="25" align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Gene Locus Tag</td>
				<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Gene Name</td>
				<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Gene ID</td>
				<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Synonyms</td>
				<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Other DB IDs</td>
				<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Description</td>
				<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">More</td>
			</tr>
			<?php
	foreach ($array_gene as $gene) {
?>
			<tr>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($gene['taxname'], ENT_QUOTES, 'UTF-8')?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($gene['locustag'], ENT_QUOTES, 'UTF-8')?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px">
<?php
		$strSql = "select * from db_mesh.t_gene where c_num_pubs>2 and c_species=" . $db->qstr($gene['species']) . " and c_gene_name=" . $db->qstr($gene['symbol']) . " limit 1";

		$rs_count = $db->Execute($strSql);

		if ($gene['symbol']!='' && $gene['symbol']!='-') {
			if (!$rs_count->EOF) {
?>
				<a href="index.php?c_species=<?php echo htmlspecialchars($gene['species'], ENT_QUOTES, 'UTF-8')?>&amp;c_gene_name=<?php echo htmlspecialchars($gene['symbol'], ENT_QUOTES, 'UTF-8')?>">
					<?php echo htmlspecialchars($gene['symbol'], ENT_QUOTES, 'UTF-8')?>
			</a>
				<?php
			}
			else {
?>
				<?php echo htmlspecialchars($gene['symbol'], ENT_QUOTES, 'UTF-8')?>
				<?php
			}
		}
?>
				</td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($gene['geneid'], ENT_QUOTES, 'UTF-8')?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars(preg_replace('/\|/', ', ', $gene['synonyms']), ENT_QUOTES, 'UTF-8')?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars(preg_replace('/\|/', ', ', $gene['dbxrefs']), ENT_QUOTES, 'UTF-8')?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo htmlspecialchars($gene['description'], ENT_QUOTES, 'UTF-8')?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><a href="http://www.phidias.us/phigen/query/host_gene_detail.php?geneid=<?php echo htmlspecialchars($gene['geneid'], ENT_QUOTES, 'UTF-8')?>">More</a></td>
			</tr>
			<?php
	}
?>
		</table>
		<p align="center">&nbsp; </p>
		<?php
}
else {
?>
		<p align="center">&nbsp; </p>
		<p align="center">No protein/gene was found. Please use different keywords. <a href="gene_query.php">Go back and try again</a>. </p>
		<?php
}
?>
  <!-- InstanceEndEditable -->
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
