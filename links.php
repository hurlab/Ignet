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
.style3 {color: #000033}
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
      <h3 align="center"><strong>Links</strong></h3>
			
<p>This page lists the literature resources, programs, and ontologies that are being or will be used in Ignet:</p>
			
<p><strong>Literature resources:</strong></p>
      <ul>
		  <li><strong>PubMed:</strong> <a href="http://www.ncbi.nlm.nih.gov/pubmed/">http://www.ncbi.nlm.nih.gov/pubmed/</a>. <em>Note</em>: PubMed resource is what Ignet is using now. </li>
		  <li><strong>PubMed Central:</strong> <a href="https://www.ncbi.nlm.nih.gov/pmc/">https://www.ncbi.nlm.nih.gov/pmc/</a>. <em>Note</em>: PubMed Central will also be used later. </li>
	  </ul> 
						
<p><strong>NLP programs:</strong></p>
      <ul>
		  <li><strong>SciMiner:</strong> Hur J, Schuyler AD, States DJ, Feldman EL. <a href="https://academic.oup.com/bioinformatics/article/25/6/838/251426">SciMiner: web-based literature mining tool for target identification and functional enrichment analysis</a>. <em>Bioinformatics</em> 2009, 25(6):838-40. PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/19188191/">19188191</a>. PMCID: <a href="http://www.ncbi.nlm.nih.gov/pmc/articles/pmc2654801/">PMC2654801</a>. </li>
		  <li><a href="https://www.violinet.org/vo-sciminer/"><strong>VO-SciMiner:</strong></a> A Vaccine Ontology (VO)-supported SciMiner program. VO-SciMiner applied VO to enhance the performance of SciMiner to ming vaccine-related gene-gene and vaccine-gene interactions. <em>Brucella</em> vaccines are used as the demonstration for this program development. See more information about VO-SciMiner in our paper: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3180695/">PMC3180695</a>. Some features of VO-SciMiner will later be incorporated to Ignet. </li>
			</ul>
			
<p><strong>Machine Learning programs:</strong></p>
      <ul><li><strong>Clairlib: </strong><a href="http://www.clairlib.org/">http://www.clairlib.org/</a>, which has been transitioned to  <strong>LILY</strong> (<a href="https://yale-lily.github.io/">https://yale-lily.github.io/</a>). LILY stands for Language, Information, and Learning at Yale. The Clair or LILY library, developed by Dr. <a href="https://cpsc.yale.edu/people/dragomir-radev">Dragomir Radev</a>'s group, includes a suite of open-source Perl modules for generic tasks in natural language processing (NLP), information retrieval (IR), and network analysis (NA). <em>Note</em> that Dr. Arzucan Ozgur, one of our Ignet developers, was previously Dr. Radev's PhD student.  </li>
	  
     <li><strong>Genomesh literature mining algorithm: </strong> Genomesh is our previously developed genome-wide literature mining and analysis method as seen in our paper (<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3852244/">PMC3852244</a>). GenoMesh provides a genome-wide analysis of gene-to-gene relationships and pathways based on the association between individual genes and <a href="https://www.nlm.nih.gov/mesh/meshhome.html">MeSH</a> terms obtained from the literature. We also consider possible incorporation of the algorithm in our future Ignet development.</li>
	<li><strong>Machine learning and rule-based literatur mining: </strong> We have developed a machine learning and rule-based literature minig method as introduced in our more recent paper (<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6927101/">PMC6927101</a>). This method has been used to identify and normalize adverse drug reactions in drug labels, and we plan to implement a similar method in Ignet later. </li>		  
	<li><strong><a href="https://tabilab.cmpe.boun.edu.tr/">TABI</a> Machine learning tools:</strong> Dr. Arzucan Ozgur's Text Analytics and BIoInformatics Lab (TABI) research has developed many other machine learning tools such as BERT-based tools, which are being evaluated for our gene/protein interaction mining and analysis. </li>		  
	  </ul>
			
		
<p><strong>Gene coverage:</strong></p>
    <ul>
		  <li><strong>Human genes</strong>: Ignet has mined all human genes defined in <a href="https://www.genenames.org/">HUGO human gene nomenclature</a> using our customized SciMiner program. </li>			  
		  <li><strong>Microbial genes</strong>: Different sets of microbial genes, including <em>E. coli</em> genes (see reference: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5348867/">PMC5348867</a>) and <em>Brucella</em> genes (see reference: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4673313/">PMC4673313</a>), are also mined and evaluated in Ignet. The definition sources of these microbial genes usually come from the NCBI genes and the Ontology of Genes and Genomes (OGG).</li> 
	</ul>
		  
<p><strong>Ontologies:</strong></p>
      <ul>
		  <li><strong>Interaction Network Ontology (INO): </strong> <a href="https://github.com/INO-ontology/ino">https://github.com/INO-ontology/ino</a>. INO is an ontology in the domain of interaction networks. INO is used in Ignet to identify exact interaction types. </li>
  		  <li><strong>Vaccine Ontology (VO): </strong><a href="https://github.com/vaccineontology/VO">https://github.com/vaccineontology/VO</a>. VO represents and classifies various types of vaccines and their semantic relations. </li>	
  		  <li><strong>Ontology of Genes and Genomes (OGG): </strong><a href="https://obofoundry.org/ontology/ogg.html">https://obofoundry.org/ontology/ogg.html</a>. OGG represents, annotates, and classifies various genes in different model organisms including human, mouse, and <em>E. coli</em>. </li>		  
  		  <li><strong><em>Note</em>: </strong>More ontologies such as the Cell Type Ontology (CL) and Cell Line Ontology (CLO) are also being investigated in our Ignet development. </li>
			
			</ul>
			
      <p>&nbsp;</p>
  <!-- InstanceEndEditable -->
</main>
<?php include('inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
