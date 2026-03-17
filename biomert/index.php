<?php
include('../inc/functions.php');
?>
<!DOCTYPE html>
<html lang="en"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>BioMert</title>
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

?>

  <div class="text-center py-8">
    <span class="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">Coming Soon</span>
    <h1 class="text-2xl font-bold text-[#1a365d] mb-2">BioMERT</h1>
    <p class="text-sm text-gray-600 max-w-xl mx-auto">BioMedical BERT NLP of Gene-Gene Interactions. Paste a biomedical abstract to identify and classify gene interactions using a fine-tuned BioBERT model.</p>
  </div>

  <div class="max-w-3xl mx-auto">

    <div class="bg-white border border-gray-200 rounded-lg p-5 mb-6">
      <form action="biomert_proc.php" enctype="multipart/form-data" method="post" id="biomert_query_id">

        <label for="querytext" class="block text-xs font-semibold text-gray-600 mb-2">Enter or paste biomedical text:</label>
        <textarea name="querytext" id="querytext" rows="12"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#2b6cb0]"
          placeholder="Paste an abstract or biomedical text here..."></textarea>

        <p class="text-xs text-gray-400 mt-1 mb-4">(<em>Examples:</em> abstract xyz...)</p>

        <div class="flex items-center gap-3">
          <button type="submit" name="submit" id="submit" value="Search" onclick="submitForm();"
            class="bg-[#ed8936] hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded transition-colors">
            Search
          </button>
          <input type="reset" name="Reset" value="Clear"
            class="bg-[#1a365d] hover:bg-[#102a4c] text-white text-sm font-semibold px-5 py-2 rounded cursor-pointer transition-colors" />
          <a href="query_help.php" class="text-xs text-[#2b6cb0] hover:underline ml-2">Search Help</a>
        </div>

      </form>
    </div>

    <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">How it works</h2>
    <div class="grid md:grid-cols-2 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-bold text-[#1a365d] mb-1">BioBERT NLP</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Uses a biomedical domain-specific BERT model fine-tuned on gene interaction corpora to identify entity mentions and classify interaction types from free text.</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-bold text-[#1a365d] mb-1">Interaction Classification</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Classifies detected gene-gene interactions by type using the Interaction Network Ontology (INO), providing structured output compatible with Ignet's database.</p>
      </div>
    </div>

    <p class="text-xs text-gray-400 italic">Note: This program is currently under active development.</p>

  </div>

  <!-- InstanceEndEditable -->
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
