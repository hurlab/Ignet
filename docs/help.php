<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet</title>
<!-- InstanceEndEditable -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="../css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
</head>
<body style="margin:0px; background-image:url(../images/bg_2008-08-21.2.gif)" id="main_body">
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
		<h3 align="center">Help and Tutorial</h3>
						
	    <p>This page provides a tutorial for using the features in the Ignet website: </p>			
				
	<p><font style="font-size: 13pt" color="#A818A8"><b>Top right search bar Query</b></font> </p>
			
	<p>You can type a keywork such as vaccine, IFNG, diabetes. Then click GO. An example is shown here: </p>			
						
	<p align="center">
          <img src="/ignet/docs/images/top_right_search.JPG" width="500"></img></p>
	
	<p>Note that the query is indeed the <a href="/ignet/dignet/index.php">Dignet</a> query. See the screenshot of the results page after the searching for the keyword "IFNG" (e.g., interferon-gamma): </p>
		<p align="center">
          <img src="/ignet/docs/images/top_right_search_results.JPG" width="666"></img></p>
			
	<p>See more information and tutorial about the Dignet query and results description below on this tutorial web page. </p> 			
	<br/>
	
	<p><font style="font-size: 13pt" color="#A818A8"><b>Ignet Gene Query</b></font> </p>			
	<p>To query a gene, you can choose a gene name, selected whether "vaccine" needs to be mentioned, type a keyword(s) (optional), and then click "Retrieve". </p>			
			
	<p>An example is shown below: </p>
			
	<p align="center">
          <img src="/ignet/docs/images/gene_query.png" width="777"></img></p>
	<p>In the example shown in the above screenshot, we selected "IL-6" and left "vaccine" mentioned Optional. See the results below: </p>
		<p align="center">
          <img src="/ignet/docs/images/gene_query_results.png" width="777"></img></p>
	<br/>
	<p>As shown in the above screenshot, the IL6 gene was ranked based on our centraility scores. Four centrality scores, including degree centrality, engenvector centrality, closeness centrality, and betweenness centrality, were calculated. The centrality scores represent the centrality of the IL6 in the identified gene network. </p>

	<p>As described in our previous publications (Ozgur et al, 2011, <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3102897/">PMC3102897</a>), the meanings of these different types of centralities are:
		<ul>
			<li>Degree centrality: the number of neighbors of a node</li>
			<li>Eigenvector centrality: function of the centralities of a node’s neighbors</li>
			<li>Closeness centrality: inverse sum of the distances from the node to the other nodes in the network</li>
			<li>Betweenness centrality: the proportion of the shortest paths between all the pairs of nodes that pass through the node in interest </li>
</ul>
</p>

<p> In addition, we have also developed an internal <em>weighting score</em> to rank the identified neighboring genes that interact with the target gene. More information will be provided in our journal publication under preparation.</p> 

<p><strong>For more examples</strong> of Ignet Gene analysis, Choose and Click: 
	<ul>
		<li><a href="/ignet/gene/index.php?geneSymbol1=A1BG">A1BG</a>, Alpha-1-B Glycoprotein</li>		
		<li><a href="/ignet/gene/index.php?geneSymbol1=IFNG">IFNG</a>, Interferon-gamma</li>
		<li><a href="/ignet/gene/index.php?geneSymbol1=IFNG">IL10</a>, Interleukin-10</li>
		<li><a href="/ignet/gene/index.php?geneSymbol1=SLC39A1">SLC39A1</a>, Solute Carrier Family 39 Member 1</li>
		<li><a href="/ignet/gene/index.php?geneSymbol1=TLR4">TLR4</a>, Toll-like recepter 4</li>
		<li><a href="/ignet/gene/index.php?geneSymbol1=IFNG">TNF</a>, Tumor necrosis factor</li> 
		</ul>
<p><strong>Note</strong>: For each of the query, you can add the requirement of 'vaccine' mentioned, and/or you can add some keyword(s) such as 'blood'. </p>
	
	<p>&nbsp;</p>
<p><font style="font-size: 13pt" color="#A818A8"><b>Ignet GenePair Query</b></font> </p>
	
  <p>Basically, on the <a href="/ignet/genepair/index.php">GenePair</a> page, you can choose two genes, and they type one keyword(s) such as blood (optional), and then click "Search" to generate the results: </p> 
	
	<p>For example, you can choose IL6 and IFNG, and then click "Search": &nbsp;</p>
		<p align="center">
          <img src="/ignet/docs/images/gene_gene_query_results.png" width="777"></img></p>

<p><strong>For more examples</strong> of GenePair analysis, you can click the following searching criterioa and find out the results:  
	<ul>
	<li>Interactions between <a href="/ignet/genepair/index.php?hasVaccine=&geneSymbol1=IL6&geneSymbol2=IFNG"> IL6 and IFNG</a>. </li>
	<li>Interactions between <a href="/ignet/genepair/index.php?hasVaccine=&geneSymbol1=IL6&geneSymbol2=IFNG&keywords=blood"> IL6 and IFNG with keyword "blood"</a>. </li> 
	<li>Interactions between <a href="/ignet/genepair/index.php?geneSymbol1=TLR4&geneSymbol2=TNF"> TLR4 and TNF</a>.</li> 
	<li>Interactions between <a href="/ignet/genepair/index.php?geneSymbol1=TLR4&geneSymbol2=IL10"> TLR4 and IL10</a>.</li> 
		<li>Interactions between <a href="/ignet/genepair/index.php?geneSymbol1=TLR4&geneSymbol2=IFNG"> TLR4 and IFNG</a>.</li> 
	</ul>			
</p>

	<p>Note that the Interaction Network Ontology (INO) interaction keywords on the rightside of the above result page can be clicked to link to the interaction type definition and hierarchy shown on the <a href="https://www.ontobee.org/">Ontobee</a> page, as demonstrated here: </p> 
		<p align="center">
          <img src="/ignet/docs/images/INO_activation.png" width="444"></img></p>

	<p>More information about how the INO ontology can help the literature mining and data analysis can be found in the following publications:	
	<ul>		
		<li>Hur J, Özgür A, Xiang Z, and He Y. <a href="https://jbiomedsem.biomedcentral.com/articles/10.1186/2041-1480-6-2">Development and application of an interaction network ontology for literature mining of vaccine-associated gene-gene interactions</a>. <em>Journal of Biomedical Semantics</em>. 2015, <strong>6</strong>:2. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/25785184">25785184</a>.</li>
		<li>Özgür A, Hur J, and He Y. <a href="https://biodatamining.biomedcentral.com/articles/10.1186/s13040-016-0118-0">The Interaction Network Ontology-supported modeling and mining of complex interactions represented with multiple keywords in biomedical literature</a>. <em>BioData Mining</em>. 2016, <strong>9</strong>:41. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/28031747">28031747</a>.</li>			
		</ul>
	</p> 	
	<p>In addition to the INO, we have also applied other ontologies, including the Vaccine Ontology (VO), to study gene interaction network. The following papers demonstrate the usage of the VO for vaccine-related gene interaction network studies: 	
	<ul>		
		<li>Hur J, Xiang Z, Feldman EL, He Y. <a href="http://www.biomedcentral.com/1471-2172/12/49">Ontology-based Brucella vaccine literature indexing and systematic analysis of gene-vaccine association network</a>. <em>BMC Immunology</em>. 12(1):49 2011 Aug 26. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/21871085">21871085</a>. PMCID: <a href="http://www.ncbi.nlm.nih.gov/pmc/articles/PMC3180695/">PMC3180695</a>.</li>
        <li>Ozgur A, Xiang Z, Radev D, and He Y. <a href="https://jbiomedsem.biomedcentral.com/articles/10.1186/2041-1480-2-S2-S8">Mining of vaccine-associated IFN-γ gene interaction networks using the Vaccine Ontology</a>. <em>Journal of Biomedical Semantics</em>. 2011, <strong>2</strong>(Suppl 2)<strong>:</strong>S8. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/21624163">21624163</a>.</li>
        <li>Hur J, Özgür A, Xiang Z, He Y. <a href="http://www.jbiomedsem.com/content/3/1/18">Identification of fever and vaccine-associated gene interaction networks using ontology-based literature mining</a>. <em>Journal of Biomedical Semantics</em>. 2012, <strong>3</strong>:18. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/23256563">23256563</a>. </li>										
		<li>Hur J, Özgür A, Xiang Z, and He Y. <a href="https://jbiomedsem.biomedcentral.com/articles/10.1186/2041-1480-6-2">Development and application of an interaction network ontology for literature mining of vaccine-associated gene-gene interactions</a>. <em>Journal of Biomedical Semantics</em>. 2015, <strong>6</strong>:2. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/25785184">25785184</a>.</li>
		</ul>
	</p> 	

<p>&nbsp;</p>
<p><font style="font-size: 13pt" color="#A818A8"><b>Dynamic Dignet Query</b></font> </p>

<p>The program is easy to run. Simply type a keyword(s), for example, "diabetes", "Brucella", or vaccine": </p>

<p>For example, below is a screenshot showing the searching for the typed keyword "vaccine": </p>

	<p>&nbsp;</p>
		<p align="center">
          <img src="/ignet/docs/images/Dignet_query.png" width="700"></img></p>

<p>&nbsp;</p>  
<p> Here are the results: </p>

	<p>&nbsp;</p>
		<p align="center">
          <img src="/ignet/docs/images/Dignet_query_results.png" width="700"></img></p>

<p>On the results pages, you can click different highlights and get different results as illustrated above.</p> 

<p>Below is the page screenshot showing the centrality calculation results:  </p> 
		<p align="center">
          <img src="/ignet/docs/images/centrality_cal.JPG" width="700"></img></p>

<p>Below is the page screenshot showing the high level graph network of the interconnected genes, which is generated using the Cytoscape Web technology: </p> 

		<p align="center">
          <img src="/ignet/docs/images/centrality_cal_graph1.JPG" width="555"></img></p>

	<p>&nbsp;</p>

<p>Below is the page screenshot showing a specific portion of the graph network of the interconnected genes: </p> 
		<p align="center">
          <img src="/ignet/docs/images/centrality_cal_graph2.JPG" width="500"></img></p>

<p><strong>For more examples</strong> of Dignet gene interaction analysis, Choose and Click: 
	<ul>
		<li>Search: <a href="/ignet/dignet/searchPubmed.php?keywords=vaccine">vaccine</a></li>		
		<li>Search: <a href="/ignet/dignet/searchPubmed.php?keywords=IFNG">IFNG</a></li>	
		<li>Search: <a href="/ignet/dignet/searchPubmed.php?keywords=diabetes">diabetes</a></li>
		<li>Search: <a href="/ignet/dignet/searchPubmed.php?keywords=podocyte">podocyte</a></li>
		</ul>
<p><strong>Note</strong>: The Ignet engine may have not yet processed most recent abstracts, so most recent results published in PubMed may not show up.</p> 

        <p>&nbsp;</p>
 <p>Please feel free to <a href="/ignet/contact_us.php">Contact Us</a> for any suggestions, comments, and collaborations. Thank you! &nbsp;</p>

        <p>&nbsp;</p>
			
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
