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
<h3 align="center">Advanced GeneMesh Search</h3>

<form action="gene_query_process.php" method="post" name="form_basic_search" id="form_basic_search">
	<p>Search genes using different parameters and output GeneMesh results:  </p>
	<table cellspacing="1" cellpadding="1" style="border:1px solid #999966">
		<tr align="center" bgcolor="#ECEFF0">
			<td width="30%" height="30" class="styleLeftColumn"><strong>Search Field</strong></td>
			<td width="70%" class="tdHeader"><strong class="styleLeftColumn">Search Parameter</strong></td>
		</tr>
		<tr>
			<td bgcolor="#FBF2BF" class="styleLeftColumn"><strong>Host Genome</strong></td>
			<td bgcolor="#FFFEF2" class="smallContent">
			<select name="species" id="species">
				<option value="Escherichia coli" selected="selected">Escherichia coli</option>
				<option value="Brucella">Brucella</option>
			</select>
			</td>
		</tr>
		<tr>
			<td bgcolor="#FBF2BF" class="styleLeftColumn"><strong>Gene Symbol </strong></td>
			<td bgcolor="#FFFEF2" class="smallContent"><input name="gene_name" type="text" size="40" maxlength="60" />
				(e.g., resD)</td>
		</tr>
		<tr>
			<td bgcolor="#FBF2BF" class="styleLeftColumn"><strong>Locus Tag </strong></td>
			<td bgcolor="#FFFEF2" class="smallContent"><input name="gene_locus_tag" type="text" id="locus_tag" size="40" maxlength="60" />
				(e.g., Z2661) </td>
		</tr>
		<tr>
			<td bgcolor="#FBF2BF" class="styleLeftColumn"><strong>NCBI GeneID </strong></td>
			<td bgcolor="#FFFEF2" class="smallContent"><input name="gene_id" type="text" id="gene_id" size="40" maxlength="60" />
				(e.g., 3244801)</td>
		</tr>
		<tr>
			<td bgcolor="#FBF2BF" class="styleLeftColumn"><strong>NCBI Protein RefSeq</strong></td>
			<td bgcolor="#FFFEF2" class="smallContent"><input name="protein_refseq" type="text" id="protein_refseq" size="40" maxlength="60" />
				(e.g., NP_753933.1) </td>
		</tr>
		<tr>
			<td bgcolor="#FBF2BF" class="styleLeftColumn"><strong>NCBI Protein GI </strong></td>
			<td bgcolor="#FFFEF2" class="smallContent"><input name="protein_id" type="text" size="40" maxlength="60" />
				(e.g., 58000293) </td>
		</tr>
		<tr>
			<td bgcolor="#FBF2BF" class="styleLeftColumn"><strong>UniProt Accession</strong></td>
			<td bgcolor="#FFFEF2" class="smallContent"><input name="uniprot_acc" type="text" id="uniprot_acc" size="40" maxlength="60" />
				(e.g., Q8FH80) </td>
		</tr>
		<tr>
			<td bgcolor="#FBF2BF" class="styleLeftColumn"><strong>Description</strong></td>
			<td bgcolor="#FFFEF2" class="smallContent"><input name="description" type="text" size="60" maxlength="60" />
					<br />
				(e.g., superoxide dismutase) </td>
		</tr>
		<tr align="center" bgcolor="#ECEFF0">
			<td colspan="2"><input name="submit1" type="submit" class="smallContent" value="  Search  " /></td>
		</tr>
	</table>
</form>

  <!-- InstanceEndEditable -->
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
