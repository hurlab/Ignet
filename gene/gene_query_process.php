<?php 
include ('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>IGNET: Interferon-gamma (IFN-γ) Network</title>
<!-- InstanceEndEditable -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="../css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
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
	$strSql .= " AND species = '$species'";
}

if ($gene_locus_tag != '') {
	$strSql .= " AND locustag = '$gene_locus_tag'";
}
if ($gene_name != '') {
	$strSql .= " AND (symbol = '$gene_name' OR MATCH (synonyms) AGAINST ('$gene_name'))";
}
if ($gene_id != '') {
	$strSql .= " AND geneid = '$gene_id'";
}

if ($protein_refseq != '') {
	$strSql .= " AND protein_acc='$protein_refseq' or protein_acc like '$protein_refseq.%' ";
}
if ($protein_id != '') {
	$strSql .= " AND protein_gi='$protein_id'";
}
if ($uniprot_acc != '') {
	$strSql .= " AND uniprot_acc='$uniprot_acc'";
}

if ($description != '') {
	$tkeywords = transformKeywords($description);
	$strSql .= " AND MATCH(symbol,locustag,synonyms,dbxrefs,description,protein_note,annotation,phi_annotation,taxname) AGAINST ('$tkeywords' IN BOOLEAN MODE)";
}

$rs = $db->Execute($strSql);
if (!$rs->EOF)
{
	$array_geneids = $rs->GetArray();
	$rs->close();

	$numOfRecords = sizeof($array_geneids);
	
	$recordsPerPage = 50;
	$numOfPage = ceil($numOfRecords / $recordsPerPage);
	
	if ($currPage == '' || $currPage > $numOfPage || $numOfPage < 1) {
		$currPage = 1;
	}
	$params = "&species=$species&phi_function=$phi_function&gene_locus_tag=$gene_locus_tag&gene_name=$gene_name&gene_id=$gene_id&gene_start=$gene_start&gene_end=$gene_end&protein_refseq=$protein_refseq&protein_id=$protein_id&uniprot_acc=$uniprot_acc&protein_weight1=$protein_weight1&protein_weight2=$protein_weight2&protein_pi1=$protein_pi1&protein_pi2=$protein_pi2&description=$description&orderby1=$orderby1&order1=$order1&orderby2=$orderby2&order2=$order2";
	$params = addslashes($params);

	$a_genes = array();
	for ($i= ($currPage-1)*$recordsPerPage; $i < $currPage*$recordsPerPage && $i < $numOfRecords; $i++) {
		$a_genes[] = $array_geneids[$i]['geneid'];
	}
	
	$geneids = implode("','", $a_genes);

	$strSql = "select * from t_gene_annotation where geneid in ('$geneids')";

	$rs = $db->Execute($strSql);
	$array_gene = array();
	if (!$rs->EOF) {
		$array_gene = $rs->GetArray();
		$rs->close();
	}
	

?>
		<p> Found
			<?php echo sizeof($array_geneids)?>
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
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $gene['taxname']?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $gene['locustag']?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px">
<?php 
		$strSql = "select * from db_mesh.t_gene where c_num_pubs>2 and c_species='{$gene['species']}' and c_gene_name='{$gene['symbol']}' limit 1";
		
		$rs_count = $db->Execute($strSql);

		if ($gene['symbol']!='' && $gene['symbol']!='-') {
			if (!$rs_count->EOF) {
?>
				<a href="index.php?c_species=<?php echo $gene['species']?>&amp;c_gene_name=<?php echo $gene['symbol']?>">
					<?php echo $gene['symbol']?>
			</a>
				<?php 
			}
			else { 
?>
				<?php echo $gene['symbol']?>
				<?php 
			}
		}
?>
				</td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $gene['geneid']?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo preg_replace('/\|/', ', ', $gene['synonyms'])?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo preg_replace('/\|/', ', ', $gene['dbxrefs'])?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $gene['description']?></td>
				<td bgcolor="#F5FAF7" style=" font-size:12px"><a href="http://www.phidias.us/phigen/query/host_gene_detail.php?geneid=<?php echo $gene['geneid']?>">More</a></td>
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
