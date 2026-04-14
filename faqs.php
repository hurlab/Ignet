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
<!-- InstanceBeginEditable name="head" -->
<style type="text/css">
<!--
.style1 {font-style: italic}
-->
</style>
<!-- InstanceEndEditable -->
</head>
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
include('inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">
  <!-- InstanceBeginEditable name="Main" -->
    <h1 class="text-xl font-bold text-[#1a365d] mb-4">Frequently Asked Questions</h1>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q1: What is Ignet?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: Ignet is a web system to dynamically annotate and visualize literature-mined gene interaction networks.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q2: Who are the primary users of Ignet?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: Gene interaction network researchers, and bioinformaticians who are interested in literature discovery and bio-ontologies.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q3: What is the coverage of "gene" in Ignet (<strong>I</strong>ntegrated <strong>g</strong>ene <strong>net</strong>work)? Does it include protein?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: Yes. In Ignet, we use the commonly applied <a href="https://pubmed.ncbi.nlm.nih.gov/15960837/" class="text-[#2b6cb0] hover:underline">GENETAG-style named entity annotation</a>, where a gene interaction involves genes or gene products (proteins). See more information in our publication: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5168857/" class="text-[#2b6cb0] hover:underline">PMC5168857</a>.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q4: What is your primary natural language processing (NLP) tool used in Ignet?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: Our primary NLP tool used in Ignet is <a href="https://pubmed.ncbi.nlm.nih.gov/19188191/" class="text-[#2b6cb0] hover:underline">SciMiner</a>, a dictionary- and rule-based literature mining program. SciMiner is developed by Dr. Junguk Hur, one of our Ignet developers. In Ignet, we have also enhanced the performance of <a href="https://pubmed.ncbi.nlm.nih.gov/?term=SciMiner+AND+ontology&sort=date" class="text-[#2b6cb0] hover:underline">SciMiner by incorporating ontologies</a>.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q5: Why is the Interaction Network Ontology (INO) used in Ignet?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: The <a href="https://www.ontobee.org/ontology/INO" class="text-[#2b6cb0] hover:underline">INO</a> is a formal ontology used to classify various types of interaction types. By classifying different types of interactions among genes mined from the publication literature, we can better classify the gene-gene interactions. We have also developed our INO-based literature mining methods to better mine the interaction types. Also see our <a href="https://pubmed.ncbi.nlm.nih.gov/?term=%22Interaction+Network+Ontology%22+AND+%22literature+mining%22&sort=date" class="text-[#2b6cb0] hover:underline">publications on INO-based literature mining</a>. Such a method enhances the gene-gene interaction mining and analysis.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q6: How can INO be used for literature mining?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: Each interaction term in INO contains an editor note that starts with the words "Literature mining terms:". All the terms following these words are considered as synonyms that can be used for literature mining. To illustrate this, an example of "activation" is provided on page: <a href="http://purl.obolibrary.org/obo/INO_0000024" class="text-[#2b6cb0] hover:underline">http://purl.obolibrary.org/obo/INO_0000024</a>.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q7: In addition to INO, do you also use other ontologies in Ignet?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: Ignet was initiated by our literature mining and analysis of vaccine-induced interferon-gamma related gene interaction network (Reference: Ozgür et al. 2011, PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/21624163/" class="text-[#2b6cb0] hover:underline">21624163</a>). In this study, we explored how the <a href="https://github.com/vaccineontology/VO" class="text-[#2b6cb0] hover:underline">Vaccine Ontology (VO)</a> can help study the vaccine-associated IFN-&gamma; gene interaction networks. After the impressive research, we also explored how to use the VO-based literature mining for <em>Brucella</em> vaccine literature indexing and systematic analysis of gene-vaccine association network (Reference: Hur et al, 2011, PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/21871085/" class="text-[#2b6cb0] hover:underline">21871085</a>). This is why you may see many vaccine related labels in Ignet. However, we can use other ontologies to study more specific research topics. For example, we can use the <a href="https://github.com/obophenotype/cell-ontology" class="text-[#2b6cb0] hover:underline">Cell Ontology (CL)</a> to mine and analyze various cell types from the literature or other publication records such as the GEO text description.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q8: What are the meanings of different centrality scores calculated in Ignet?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: Four different centrality measures are used to calculate the importance of genes in the literature-mined gene-gene interaction network (Ref: <a href="https://academic.oup.com/bioinformatics/article/24/13/i277/236041?login=false" class="text-[#2b6cb0] hover:underline">Ozgur et al, 2008</a>, and <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3102897/" class="text-[#2b6cb0] hover:underline">Ozgur et al, 2011</a>). Degree centrality is the number of neighbors of a gene (i.e., the number of genes that the given gene interacts with). In eigenvector (PageRank) centrality, each neighbor contributes proportionally to its own centrality to the centrality of a gene. Closeness centrality is based on the geodesic distance of a gene to the other genes in the interaction network. A gene is considered more central if it is closer to the other genes in the network. Betweenness centrality is based on the proportion of shortest paths between pairs of genes that pass over the given gene. A gene is more central if it lies on many such paths in the network.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q9: In addition to mining gene-gene interactions, could you also mine other types of gene interactions such as vaccine-gene interactions?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: Yes. As seen in our article (<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3180695/" class="text-[#2b6cb0] hover:underline">PMC3180695</a>), we previously developed our Vaccine Ontology (VO)-based SciMiner method (VO-SciMiner) to mine vaccine-gene interactions. Our study showed that the usage of VO significantly improved our mining of vaccine-gene interactions. Furthermore, we have developed a VO-SciMiner program (<a href="https://www.violinet.org/vo-sciminer" class="text-[#2b6cb0] hover:underline">https://www.violinet.org/vo-sciminer</a>) to demonstrate its usage for mining the interactions between <em>Brucella</em> vaccines and various genes. Similarly, we can change the Vaccine Ontology to another ontology such as Cell Ontology (CL) to mine the interactions between different cell types and genes.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <h3 class="text-sm font-bold text-[#1a365d] mb-2">Q10: How frequently is the Ignet literature mining resource updated? Why did I not get any results when searching for "COVID-19"?</h3>
      <p class="text-sm text-gray-700 leading-relaxed">A: Ignet was updated before the COVID-19 pandemic, which is why you won't get any results when searching for COVID-19. We are currently optimizing our automatic updating program and expect to have a newly updated Ignet resource available for the public soon.</p>
    </div>
  <!-- InstanceEndEditable -->
</main>
<?php include('inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
