<!DOCTYPE html>
<html lang="en"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet - Analyze Text</title>
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
    <h1 class="text-2xl font-bold text-[#1a365d] mb-2">Custom Text Analysis</h1>
    <p class="text-sm text-gray-600 max-w-xl mx-auto">Paste or upload your own biomedical text and let Ignet extract gene interactions, build networks, and provide AI-powered interpretation.</p>
  </div>

  <div class="max-w-3xl mx-auto">
    <!-- Input Area (placeholder UI) -->
    <div class="bg-white border border-gray-200 rounded-lg p-5 mb-6">
      <label for="usertext" class="block text-sm font-semibold text-gray-700 mb-2">Paste your text</label>
      <textarea id="usertext" rows="8" disabled placeholder="Paste an abstract, manuscript section, or grant text here... (Feature coming soon)" class="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-400 bg-gray-50 resize-y"></textarea>
      <div class="flex items-center gap-3 mt-3">
        <button disabled class="bg-gray-300 text-gray-500 px-4 py-2 rounded text-sm font-medium cursor-not-allowed">Analyze</button>
        <span class="text-xs text-gray-400">Or upload: TXT, PDF, DOCX</span>
        <span class="text-xs text-gray-400 ml-auto">Or enter PubMed IDs</span>
      </div>
    </div>

    <!-- What it will do -->
    <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">How it works</h2>
    <div class="grid md:grid-cols-2 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-bold text-[#1a365d] mb-1">Entity Extraction</h3>
        <p class="text-xs text-gray-500 leading-relaxed">SciMiner identifies genes (25,256 HUGO symbols), drugs (153K DrugBank terms), diseases (11,840 HDO terms), vaccines (3,454 VO terms), and interaction types (1,051 INO terms).</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-bold text-[#1a365d] mb-1">Network Construction</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Build interaction networks from your text. Score interactions with BioBERT. Type interactions with INO ontology. Visualize in Cytoscape.js.</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-bold text-[#1a365d] mb-1">Context Expansion</h3>
        <p class="text-xs text-gray-500 leading-relaxed">For each gene pair found, Ignet queries its full PubMed-mined database to add supporting evidence and discover connections your text may have missed.</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-bold text-[#1a365d] mb-1">AI Interpretation</h3>
        <p class="text-xs text-gray-500 leading-relaxed">LLM-powered summarization, hypothesis generation, and pathway comparison. Ask questions about your network in natural language.</p>
      </div>
    </div>

    <!-- Use cases -->
    <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Use cases</h2>
    <ul class="text-sm text-gray-600 space-y-2 mb-8">
      <li class="flex items-start gap-2"><span class="text-[#38a169] mt-0.5 font-bold">1.</span> <span><strong>Manuscript review</strong> -- Identify all gene interactions, cross-reference with existing literature</span></li>
      <li class="flex items-start gap-2"><span class="text-[#38a169] mt-0.5 font-bold">2.</span> <span><strong>Grant writing</strong> -- Map proposed interaction networks, identify evidence gaps</span></li>
      <li class="flex items-start gap-2"><span class="text-[#38a169] mt-0.5 font-bold">3.</span> <span><strong>Lab notebook analysis</strong> -- Structure biological entities and interactions from experimental notes</span></li>
    </ul>
  </div>

  <!-- InstanceEndEditable -->
</main>
<?php include('inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
