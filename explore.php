<!DOCTYPE html>
<html lang="en"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet - Explore Networks</title>
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

  <div class="text-center py-8">
    <span class="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">Coming Soon</span>
    <h1 class="text-2xl font-bold text-[#1a365d] mb-2">Explore Networks</h1>
    <p class="text-sm text-gray-600 max-w-xl mx-auto">Browse pre-built gene interaction networks by research topic. Discover curated networks for immunology, cancer biology, vaccine research, and more.</p>
  </div>

  <div class="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto my-8">
    <div class="bg-white border border-gray-200 rounded-lg p-5 opacity-60">
      <h3 class="text-sm font-bold text-[#1a365d] mb-1">Immunology</h3>
      <p class="text-xs text-gray-500 mb-2">Cytokine signaling, immune cell interactions, inflammatory pathways</p>
      <span class="text-xs text-gray-400">Coming soon</span>
    </div>
    <div class="bg-white border border-gray-200 rounded-lg p-5 opacity-60">
      <h3 class="text-sm font-bold text-[#1a365d] mb-1">Cancer Biology</h3>
      <p class="text-xs text-gray-500 mb-2">Oncogenes, tumor suppressors, signaling cascades, drug targets</p>
      <span class="text-xs text-gray-400">Coming soon</span>
    </div>
    <div class="bg-white border border-gray-200 rounded-lg p-5 opacity-60">
      <h3 class="text-sm font-bold text-[#1a365d] mb-1">Vaccine Research</h3>
      <p class="text-xs text-gray-500 mb-2">Vaccine-associated gene networks, adjuvant targets, immune response</p>
      <span class="text-xs text-gray-400">Coming soon</span>
    </div>
    <div class="bg-white border border-gray-200 rounded-lg p-5 opacity-60">
      <h3 class="text-sm font-bold text-[#1a365d] mb-1">Infectious Disease</h3>
      <p class="text-xs text-gray-500 mb-2">Host-pathogen interactions, antimicrobial resistance, viral mechanisms</p>
      <span class="text-xs text-gray-400">Coming soon</span>
    </div>
    <div class="bg-white border border-gray-200 rounded-lg p-5 opacity-60">
      <h3 class="text-sm font-bold text-[#1a365d] mb-1">Neurodegeneration</h3>
      <p class="text-xs text-gray-500 mb-2">Alzheimer's, Parkinson's, ALS gene networks and drug interactions</p>
      <span class="text-xs text-gray-400">Coming soon</span>
    </div>
    <div class="bg-white border border-gray-200 rounded-lg p-5 opacity-60">
      <h3 class="text-sm font-bold text-[#1a365d] mb-1">Cardiovascular</h3>
      <p class="text-xs text-gray-500 mb-2">Lipid metabolism, cardiac signaling, hypertension gene networks</p>
      <span class="text-xs text-gray-400">Coming soon</span>
    </div>
  </div>

  <!-- InstanceEndEditable -->
</main>
<?php include('inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
