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

    <!-- Ignet 2.0 Announcement Banner -->
    <div class="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center mb-8 mt-4">
      <div class="text-5xl mb-3">🚀</div>
      <h2 class="text-lg font-bold text-navy mb-2">Ignet 2.0 is Now Available</h2>
      <p class="text-gray-600 text-sm max-w-xl mx-auto mb-4">
        Ignet has been rebuilt with a modern React interface, interactive network visualization,
        AI-powered gene summaries, CSV export, and a REST API with 19 endpoints.
      </p>
      <a href="/ignet/"
         class="inline-flex items-center gap-2 bg-navy hover:bg-navy-dark text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm shadow-sm">
        Go to Ignet 2.0
      </a>
      <p class="text-gray-400 text-xs mt-3">
        You are viewing the legacy interface. It remains fully functional.
      </p>
    </div>

    <!-- Hero Section -->
    <div class="text-center py-10">
      <h1 class="text-3xl font-bold text-[#1a365d] mb-3">Integrative Gene Interaction Network</h1>
      <p class="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">Discover, analyze, and visualize gene-gene interaction networks from all PubMed literature. Powered by NLP, ontology, and AI.</p>
      <div class="mt-6 flex justify-center gap-3">
        <a href="/ignet/dignet/index.php" class="bg-[#ed8936] hover:bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">Search PubMed Networks</a>
        <a href="/ignet/gene/index.php" class="border border-[#2b6cb0] text-[#2b6cb0] hover:bg-blue-50 px-5 py-2 rounded-lg text-sm font-semibold transition">Explore Genes</a>
      </div>
    </div>

    <!-- Core Tools -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
      <a href="/ignet/dignet/index.php" class="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition group">
        <h3 class="text-sm font-bold text-[#1a365d] group-hover:text-[#2b6cb0] mb-1">Network Search</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Build dynamic interaction networks from any PubMed query. Compute centrality scores and visualize results.</p>
      </a>
      <a href="/ignet/gene/index.php" class="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition group">
        <h3 class="text-sm font-bold text-[#1a365d] group-hover:text-[#2b6cb0] mb-1">Gene</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Explore interaction networks centered on individual genes. View neighbors, centrality rankings, and publications.</p>
      </a>
      <a href="/ignet/genepair/index.php" class="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition group">
        <h3 class="text-sm font-bold text-[#1a365d] group-hover:text-[#2b6cb0] mb-1">GenePair</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Analyze specific gene pairs with BioBERT-powered interaction prediction and supporting evidence.</p>
      </a>
      <a href="/ignet/biosummarAI/index.php" class="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition group">
        <h3 class="text-sm font-bold text-[#1a365d] group-hover:text-[#2b6cb0] mb-1">BioSummarAI</h3>
        <p class="text-xs text-gray-500 leading-relaxed">AI-powered summarization and conversational analysis of biomedical literature and gene interactions.</p>
      </a>
    </div>

    <!-- New in 2.0 -->
    <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">New in Ignet 2.0</h2>
    <div class="grid md:grid-cols-3 gap-4 mb-8">
      <a href="/ignet/analyze.php" class="block bg-white rounded-lg border border-orange-200 p-5 hover:shadow-md transition group relative">
        <span class="absolute top-3 right-3 bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">COMING SOON</span>
        <h3 class="text-sm font-bold text-[#1a365d] group-hover:text-[#2b6cb0] mb-1">Analyze Your Text</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Paste a manuscript, abstract, or grant text. Ignet extracts gene interactions, builds networks, and discovers connections you may have missed.</p>
      </a>
      <a href="/ignet/explore.php" class="block bg-white rounded-lg border border-orange-200 p-5 hover:shadow-md transition group relative">
        <span class="absolute top-3 right-3 bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">COMING SOON</span>
        <h3 class="text-sm font-bold text-[#1a365d] group-hover:text-[#2b6cb0] mb-1">Explore Networks</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Browse curated gene interaction networks by research domain: immunology, cancer, vaccines, neurodegeneration, and more.</p>
      </a>
      <a href="/ignet/login.php" class="block bg-white rounded-lg border border-orange-200 p-5 hover:shadow-md transition group relative">
        <span class="absolute top-3 right-3 bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">COMING SOON</span>
        <h3 class="text-sm font-bold text-[#1a365d] group-hover:text-[#2b6cb0] mb-1">User Accounts & BYOK</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Save queries, view history, and bring your own LLM API key for extended AI-powered analysis. REST API access for developers.</p>
      </a>
    </div>

    <!-- About Section -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 my-8">
      <h2 class="text-lg font-bold text-[#1a365d] mb-3">About Ignet</h2>
      <div class="text-sm text-gray-700 leading-relaxed space-y-3 max-w-4xl">
        <p>Ignet mines all human genes defined in <a class="text-[#2b6cb0] hover:underline" href="https://www.genenames.org/">HUGO nomenclature</a> and extracts gene-gene interactions from PubMed abstracts using <a class="text-[#2b6cb0] hover:underline" href="https://pubmed.ncbi.nlm.nih.gov/19188191/">SciMiner</a>, a dictionary- and rule-based NLP system. Interactions are enriched with ontology annotations from <a class="text-[#2b6cb0] hover:underline" href="https://github.com/INO-ontology/ino">INO</a> (Interaction Network Ontology) and <a class="text-[#2b6cb0] hover:underline" href="https://github.com/vaccineontology/VO">VO</a> (Vaccine Ontology).</p>
        <p>For each network, Ignet computes four centrality scores (Degree, Eigenvector, Closeness, and Betweenness) to identify key hub genes and their structural roles (<a class="text-[#2b6cb0] hover:underline" href="https://academic.oup.com/bioinformatics/article/24/13/i277/236041">Ozgur et al., 2008</a>).</p>
      </div>
    </div>

    <!-- Citation -->
    <div class="my-8">
      <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Cite Ignet</h2>
      <blockquote class="border-l-4 border-[#2b6cb0] pl-4 text-xs text-gray-600 italic leading-relaxed">
        Ozgur A, Hur J, Xiang Z, Ong E, Radev D, and He Y. Ignet: A centrality and INO-based web system for analyzing and visualizing literature-mined networks. ICBO-2016 &amp; BioCreative 2016, Oregon State University. (<a class="text-[#2b6cb0] hover:underline" href="http://ceur-ws.org/Vol-1747/BP01_ICBO2016.pdf">PDF</a>)
      </blockquote>
    </div>

  <!-- InstanceEndEditable -->
</main>
<?php include('inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
