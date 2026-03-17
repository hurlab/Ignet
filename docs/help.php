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
    <h1 class="text-xl font-bold text-[#1a365d] mb-4">Help &amp; Tutorial</h1>

    <p class="text-sm text-gray-700 leading-relaxed mb-4">This page provides a tutorial for using the features in the Ignet website.</p>

    <!-- Table of Contents -->
    <div class="bg-white border border-gray-200 rounded-lg p-5 mb-6">
      <h2 class="text-lg font-bold text-[#1a365d] mb-2">Table of Contents</h2>
      <ol class="list-decimal list-inside space-y-1 text-sm">
        <li><a href="#search-bar" class="text-[#2b6cb0] hover:underline">Top Right Search Bar Query</a></li>
        <li><a href="#gene-query" class="text-[#2b6cb0] hover:underline">Ignet Gene Query</a></li>
        <li><a href="#genepair-query" class="text-[#2b6cb0] hover:underline">Ignet GenePair Query</a></li>
        <li><a href="#dignet-query" class="text-[#2b6cb0] hover:underline">Dynamic Dignet Query</a></li>
      </ol>
    </div>

    <!-- Section 1: Top Right Search Bar -->
    <div id="search-bar" class="bg-white border border-gray-200 rounded-lg p-5 mb-4">
      <h2 class="text-lg font-bold text-[#1a365d] mb-2">1. Top Right Search Bar Query</h2>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">You can type a keyword such as vaccine, IFNG, or diabetes. Then click GO. An example is shown here:</p>
      <p class="text-center">
        <img src="/ignet/docs/images/top_right_search.JPG" width="500" class="max-w-full rounded border border-gray-200 my-3" alt="Top right search bar example">
      </p>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">Note that the query is indeed the <a href="/ignet/dignet/index.php" class="text-[#2b6cb0] hover:underline">Dignet</a> query. See the screenshot of the results page after searching for the keyword "IFNG" (e.g., interferon-gamma):</p>
      <p class="text-center">
        <img src="/ignet/docs/images/top_right_search_results.JPG" width="666" class="max-w-full rounded border border-gray-200 my-3" alt="Top right search results">
      </p>
      <p class="text-sm text-gray-700 leading-relaxed">See more information and tutorial about the Dignet query and results description below on this tutorial web page.</p>
    </div>

    <!-- Section 2: Gene Query -->
    <div id="gene-query" class="bg-white border border-gray-200 rounded-lg p-5 mb-4">
      <h2 class="text-lg font-bold text-[#1a365d] mb-2">2. Ignet Gene Query</h2>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">To query a gene, you can choose a gene name, select whether "vaccine" needs to be mentioned, type a keyword(s) (optional), and then click "Retrieve".</p>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">An example is shown below:</p>
      <p class="text-center">
        <img src="/ignet/docs/images/gene_query.png" width="777" class="max-w-full rounded border border-gray-200 my-3" alt="Gene query form">
      </p>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">In the example shown above, we selected "IL-6" and left "vaccine" mentioned as Optional. See the results below:</p>
      <p class="text-center">
        <img src="/ignet/docs/images/gene_query_results.png" width="777" class="max-w-full rounded border border-gray-200 my-3" alt="Gene query results">
      </p>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">As shown above, the IL6 gene was ranked based on our centrality scores. Four centrality scores were calculated: degree centrality, eigenvector centrality, closeness centrality, and betweenness centrality. These represent the centrality of IL6 in the identified gene network.</p>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">As described in our previous publications (Ozgur et al, 2011, <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3102897/" class="text-[#2b6cb0] hover:underline">PMC3102897</a>), the meanings of these different types of centralities are:</p>
      <ul class="list-disc list-inside space-y-1 text-sm text-gray-700 mb-3 ml-2">
        <li><strong>Degree centrality:</strong> the number of neighbors of a node</li>
        <li><strong>Eigenvector centrality:</strong> function of the centralities of a node's neighbors</li>
        <li><strong>Closeness centrality:</strong> inverse sum of the distances from the node to the other nodes in the network</li>
        <li><strong>Betweenness centrality:</strong> the proportion of the shortest paths between all the pairs of nodes that pass through the node in interest</li>
      </ul>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">In addition, we have also developed an internal <em>weighting score</em> to rank the identified neighboring genes that interact with the target gene. More information will be provided in our journal publication under preparation.</p>
      <p class="text-sm font-semibold text-[#1a365d] mb-1">For more examples of Ignet Gene analysis, choose and click:</p>
      <ul class="list-disc list-inside space-y-1 text-sm ml-2">
        <li><a href="/ignet/gene/index.php?geneSymbol1=A1BG" class="text-[#2b6cb0] hover:underline">A1BG</a>, Alpha-1-B Glycoprotein</li>
        <li><a href="/ignet/gene/index.php?geneSymbol1=IFNG" class="text-[#2b6cb0] hover:underline">IFNG</a>, Interferon-gamma</li>
        <li><a href="/ignet/gene/index.php?geneSymbol1=IFNG" class="text-[#2b6cb0] hover:underline">IL10</a>, Interleukin-10</li>
        <li><a href="/ignet/gene/index.php?geneSymbol1=SLC39A1" class="text-[#2b6cb0] hover:underline">SLC39A1</a>, Solute Carrier Family 39 Member 1</li>
        <li><a href="/ignet/gene/index.php?geneSymbol1=TLR4" class="text-[#2b6cb0] hover:underline">TLR4</a>, Toll-like receptor 4</li>
        <li><a href="/ignet/gene/index.php?geneSymbol1=IFNG" class="text-[#2b6cb0] hover:underline">TNF</a>, Tumor necrosis factor</li>
      </ul>
      <p class="text-sm text-gray-500 mt-2 italic">Note: For each query, you can add the requirement of 'vaccine' mentioned, and/or add keyword(s) such as 'blood'.</p>
    </div>

    <!-- Section 3: GenePair Query -->
    <div id="genepair-query" class="bg-white border border-gray-200 rounded-lg p-5 mb-4">
      <h2 class="text-lg font-bold text-[#1a365d] mb-2">3. Ignet GenePair Query</h2>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">On the <a href="/ignet/genepair/index.php" class="text-[#2b6cb0] hover:underline">GenePair</a> page, you can choose two genes, type one keyword(s) such as blood (optional), and then click "Search" to generate the results.</p>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">For example, you can choose IL6 and IFNG, and then click "Search":</p>
      <p class="text-center">
        <img src="/ignet/docs/images/gene_gene_query_results.png" width="777" class="max-w-full rounded border border-gray-200 my-3" alt="GenePair query results">
      </p>
      <p class="text-sm font-semibold text-[#1a365d] mb-1">For more examples of GenePair analysis:</p>
      <ul class="list-disc list-inside space-y-1 text-sm ml-2 mb-3">
        <li>Interactions between <a href="/ignet/genepair/index.php?hasVaccine=&geneSymbol1=IL6&geneSymbol2=IFNG" class="text-[#2b6cb0] hover:underline">IL6 and IFNG</a></li>
        <li>Interactions between <a href="/ignet/genepair/index.php?hasVaccine=&geneSymbol1=IL6&geneSymbol2=IFNG&keywords=blood" class="text-[#2b6cb0] hover:underline">IL6 and IFNG with keyword "blood"</a></li>
        <li>Interactions between <a href="/ignet/genepair/index.php?geneSymbol1=TLR4&geneSymbol2=TNF" class="text-[#2b6cb0] hover:underline">TLR4 and TNF</a></li>
        <li>Interactions between <a href="/ignet/genepair/index.php?geneSymbol1=TLR4&geneSymbol2=IL10" class="text-[#2b6cb0] hover:underline">TLR4 and IL10</a></li>
        <li>Interactions between <a href="/ignet/genepair/index.php?geneSymbol1=TLR4&geneSymbol2=IFNG" class="text-[#2b6cb0] hover:underline">TLR4 and IFNG</a></li>
      </ul>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">Note that the Interaction Network Ontology (INO) interaction keywords on the right side of the result page can be clicked to link to the interaction type definition and hierarchy shown on the <a href="https://www.ontobee.org/" class="text-[#2b6cb0] hover:underline">Ontobee</a> page, as demonstrated here:</p>
      <p class="text-center">
        <img src="/ignet/docs/images/INO_activation.png" width="444" class="max-w-full rounded border border-gray-200 my-3" alt="INO activation example">
      </p>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">More information about how the INO ontology can help literature mining and data analysis can be found in the following publications:</p>
      <ul class="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2 mb-3">
        <li>Hur J, Özgür A, Xiang Z, and He Y. <a href="https://jbiomedsem.biomedcentral.com/articles/10.1186/2041-1480-6-2" class="text-[#2b6cb0] hover:underline">Development and application of an interaction network ontology for literature mining of vaccine-associated gene-gene interactions</a>. <em>Journal of Biomedical Semantics</em>. 2015, <strong>6</strong>:2. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/25785184" class="text-[#2b6cb0] hover:underline">25785184</a>.</li>
        <li>Özgür A, Hur J, and He Y. <a href="https://biodatamining.biomedcentral.com/articles/10.1186/s13040-016-0118-0" class="text-[#2b6cb0] hover:underline">The Interaction Network Ontology-supported modeling and mining of complex interactions represented with multiple keywords in biomedical literature</a>. <em>BioData Mining</em>. 2016, <strong>9</strong>:41. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/28031747" class="text-[#2b6cb0] hover:underline">28031747</a>.</li>
      </ul>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">In addition to the INO, we have also applied other ontologies, including the Vaccine Ontology (VO), to study gene interaction networks. The following papers demonstrate the usage of VO for vaccine-related gene interaction network studies:</p>
      <ul class="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
        <li>Hur J, Xiang Z, Feldman EL, He Y. <a href="http://www.biomedcentral.com/1471-2172/12/49" class="text-[#2b6cb0] hover:underline">Ontology-based Brucella vaccine literature indexing and systematic analysis of gene-vaccine association network</a>. <em>BMC Immunology</em>. 12(1):49 2011 Aug 26. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/21871085" class="text-[#2b6cb0] hover:underline">21871085</a>. PMCID: <a href="http://www.ncbi.nlm.nih.gov/pmc/articles/PMC3180695/" class="text-[#2b6cb0] hover:underline">PMC3180695</a>.</li>
        <li>Ozgur A, Xiang Z, Radev D, and He Y. <a href="https://jbiomedsem.biomedcentral.com/articles/10.1186/2041-1480-2-S2-S8" class="text-[#2b6cb0] hover:underline">Mining of vaccine-associated IFN-&gamma; gene interaction networks using the Vaccine Ontology</a>. <em>Journal of Biomedical Semantics</em>. 2011, <strong>2</strong>(Suppl 2)<strong>:</strong>S8. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/21624163" class="text-[#2b6cb0] hover:underline">21624163</a>.</li>
        <li>Hur J, Özgür A, Xiang Z, He Y. <a href="http://www.jbiomedsem.com/content/3/1/18" class="text-[#2b6cb0] hover:underline">Identification of fever and vaccine-associated gene interaction networks using ontology-based literature mining</a>. <em>Journal of Biomedical Semantics</em>. 2012, <strong>3</strong>:18. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/23256563" class="text-[#2b6cb0] hover:underline">23256563</a>.</li>
        <li>Hur J, Özgür A, Xiang Z, and He Y. <a href="https://jbiomedsem.biomedcentral.com/articles/10.1186/2041-1480-6-2" class="text-[#2b6cb0] hover:underline">Development and application of an interaction network ontology for literature mining of vaccine-associated gene-gene interactions</a>. <em>Journal of Biomedical Semantics</em>. 2015, <strong>6</strong>:2. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/25785184" class="text-[#2b6cb0] hover:underline">25785184</a>.</li>
      </ul>
    </div>

    <!-- Section 4: Dignet Query -->
    <div id="dignet-query" class="bg-white border border-gray-200 rounded-lg p-5 mb-4">
      <h2 class="text-lg font-bold text-[#1a365d] mb-2">4. Dynamic Dignet Query</h2>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">The program is easy to run. Simply type a keyword(s), for example, "diabetes", "Brucella", or "vaccine".</p>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">For example, below is a screenshot showing the search for the keyword "vaccine":</p>
      <p class="text-center">
        <img src="/ignet/docs/images/Dignet_query.png" width="700" class="max-w-full rounded border border-gray-200 my-3" alt="Dignet query form">
      </p>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">Here are the results:</p>
      <p class="text-center">
        <img src="/ignet/docs/images/Dignet_query_results.png" width="700" class="max-w-full rounded border border-gray-200 my-3" alt="Dignet query results">
      </p>
      <p class="text-sm text-gray-700 leading-relaxed mb-3">On the results pages, you can click different highlights and get different results as illustrated above.</p>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">Below is the page screenshot showing the centrality calculation results:</p>
      <p class="text-center">
        <img src="/ignet/docs/images/centrality_cal.JPG" width="700" class="max-w-full rounded border border-gray-200 my-3" alt="Centrality calculation results">
      </p>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">Below is the page screenshot showing the high-level graph network of the interconnected genes, generated using the Cytoscape Web technology:</p>
      <p class="text-center">
        <img src="/ignet/docs/images/centrality_cal_graph1.JPG" width="555" class="max-w-full rounded border border-gray-200 my-3" alt="Gene interaction network graph">
      </p>
      <p class="text-sm text-gray-700 leading-relaxed mb-2">Below is the page screenshot showing a specific portion of the graph network of the interconnected genes:</p>
      <p class="text-center">
        <img src="/ignet/docs/images/centrality_cal_graph2.JPG" width="500" class="max-w-full rounded border border-gray-200 my-3" alt="Partial gene network graph">
      </p>
      <p class="text-sm font-semibold text-[#1a365d] mb-1">For more examples of Dignet gene interaction analysis:</p>
      <ul class="list-disc list-inside space-y-1 text-sm ml-2 mb-3">
        <li>Search: <a href="/ignet/dignet/searchPubmed.php?keywords=vaccine" class="text-[#2b6cb0] hover:underline">vaccine</a></li>
        <li>Search: <a href="/ignet/dignet/searchPubmed.php?keywords=IFNG" class="text-[#2b6cb0] hover:underline">IFNG</a></li>
        <li>Search: <a href="/ignet/dignet/searchPubmed.php?keywords=diabetes" class="text-[#2b6cb0] hover:underline">diabetes</a></li>
        <li>Search: <a href="/ignet/dignet/searchPubmed.php?keywords=podocyte" class="text-[#2b6cb0] hover:underline">podocyte</a></li>
      </ul>
      <p class="text-sm text-gray-500 italic">Note: The Ignet engine may have not yet processed the most recent abstracts, so results published recently in PubMed may not show up.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-5 mb-4">
      <p class="text-sm text-gray-700 leading-relaxed">Please feel free to <a href="/ignet/contact_us.php" class="text-[#2b6cb0] hover:underline">Contact Us</a> for any suggestions, comments, and collaborations. Thank you!</p>
    </div>
  <!-- InstanceEndEditable -->
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
