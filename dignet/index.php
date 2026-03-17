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

  <div class="text-center py-6">
    <h1 class="text-2xl font-bold text-[#1a365d] mb-2">Network Search</h1>
    <p class="text-sm text-gray-600 max-w-xl mx-auto">Search PubMed by keywords, extract gene-gene interactions from matched publications, compute centrality scores, and visualize the resulting network.</p>
  </div>

  <div class="max-w-2xl mx-auto">
    <form action="searchPubmed.php" method="post" class="bg-white border border-gray-200 rounded-lg p-5 mb-6">
      <label for="keywords2" class="block text-xs font-semibold text-gray-600 mb-2">PubMed Keywords</label>
      <div class="flex items-center gap-3">
        <input type="text" name="keywords" id="keywords2" placeholder="e.g., vaccine, diabetes, Brucella, IFNG cancer"
               class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
        <button type="submit" name="Submit2" value="Search"
                class="bg-[#ed8936] hover:bg-orange-500 text-white px-5 py-2 rounded text-sm font-medium transition">Search</button>
      </div>
      <p class="text-xs text-gray-400 mt-2">Searches PubMed via NCBI E-utilities, then processes results through the Dignet interaction mining engine.</p>
    </form>

    <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Examples</h2>
    <div class="grid md:grid-cols-3 gap-3 mb-8">
      <a href="searchPubmed.php?keywords=vaccine" class="block bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition text-center">
        <span class="text-sm font-medium text-[#2b6cb0]">vaccine</span>
        <p class="text-xs text-gray-400 mt-0.5">Vaccine-associated gene networks</p>
      </a>
      <a href="searchPubmed.php?keywords=diabetes" class="block bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition text-center">
        <span class="text-sm font-medium text-[#2b6cb0]">diabetes</span>
        <p class="text-xs text-gray-400 mt-0.5">Diabetes gene interactions</p>
      </a>
      <a href="searchPubmed.php?keywords=BRCA1+breast+cancer" class="block bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition text-center">
        <span class="text-sm font-medium text-[#2b6cb0]">BRCA1 breast cancer</span>
        <p class="text-xs text-gray-400 mt-0.5">BRCA1 in breast cancer context</p>
      </a>
    </div>

    <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">What happens next</h2>
    <div class="space-y-2 mb-8 text-sm text-gray-600">
      <div class="flex items-start gap-3">
        <span class="bg-[#1a365d] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
        <span>PubMed is searched for your keywords and matching PMIDs are retrieved</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="bg-[#1a365d] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
        <span>Gene pairs are extracted from matched publications in the Ignet database</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="bg-[#1a365d] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
        <span>Centrality scores (Degree, Eigenvector, Closeness, Betweenness) are computed</span>
      </div>
      <div class="flex items-start gap-3">
        <span class="bg-[#1a365d] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
        <span>An interactive network graph is generated for visualization and export</span>
      </div>
    </div>
  </div>

  <!-- InstanceEndEditable -->
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
