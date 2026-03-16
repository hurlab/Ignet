<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet</title>
<!-- InstanceEndEditable -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" -->
<style type="text/css">
<!--
.style1 {font-style: italic}
-->
</style>
<!-- InstanceEndEditable -->
</head>
<body style="margin:0px; background-image:url(images/bg_2008-08-21.2.gif)" id="main_body">
<?php 

include('inc/template_top.php');
?>
<table width="100%" border="0" cellpadding="0" cellspacing="0">
	<tr>
		<td width="160" valign="top" style="min-width:160px">
<?php 
include('inc/template_left.php');
?>
		</td>
		<td valign="top">
		<div style="margin:6px 10px 16px 10px; border-top:2px #4A2F65 solid">
		<!-- InstanceBeginEditable name="Main" -->
            <h3 align="center" class="style1">Frequently Asked Questions</h3>
            <p><strong>1. What is Ignet?  </strong></p>
<p> Igent is a web system to dynamically annotate and visualize literature mined gene interaction interaction networks. </p>
            <p><strong>2.</strong><strong> Who are primary users of Ignet?</strong></p>			
            <p> Gene interaction network researchers, and bioinformaticians who are interested in literature discovery and bio-ontologies. </p>
			
            <p><strong>3.</strong><strong> What is the coverage of "gene" in Ignet (<strong>I</strong>ntegrated <strong>g</strong>ene <strong>net</strong>work)? Does it include protein?</strong></p>			
            <p> Yes. In Ignet, we use the commonly applied <a href="https://pubmed.ncbi.nlm.nih.gov/15960837/">GENETAG-style named entity annotation</a>, where a gene interaction involves genes or gene products (proteins). See more information in our publication: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5168857/">PMC5168857</a>. </p> 			
			
            <p><strong>4.</strong><strong> What is your primary natural language processing (NLP) tool used in Ignet? </strong></p>
            <p> Our primary NLP tool used in Ignet is the <a href="https://pubmed.ncbi.nlm.nih.gov/19188191/">SciMiner</a>, a dictionary- and rule-based literature mining program. SciMier is developed by Dr. Junguk Hur, one of our Ignet developers. In Ignet, we have also enhanced the performance of <a href="https://pubmed.ncbi.nlm.nih.gov/?term=SciMiner+AND+ontology&sort=date">SciMiner by incorporating ontologies</a>. </p> 
            <p><strong>5. Why the Interaction Network Ontology (INO) is used in Ignet?</strong></p>
<p>The <a href="https://www.ontobee.org/ontology/INO">INO</a> is a formal ontology used to classify various types of interaction types. By classifying different types of interactions among genes mined from the publication literature, we will better classify the gene-gene interactions. We have also developed our INO-based literature mining methods (see below) to better mine the interaction types. Also see our <a href="https://pubmed.ncbi.nlm.nih.gov/?term=%22Interaction+Network+Ontology%22+AND+%22literature+mining%22&sort=date">publications on INO-based literature mining</a>. Such a method enhances the gene-gene interaction mining and analysis. <br/> 
            </p>
            <p><strong>6. How INO can be used for literature mining?</strong></p>
<p>Each interaction term in INO contains an editor note that starts with the words &quot;Literature mining terms:&quot;. All the terms following these words are considered as synonyms that can be used for literature mining. To illustrate this, an example of "activation" is provided on page: <a href="http://purl.obolibrary.org/obo/INO_0000024">http://purl.obolibrary.org/obo/INO_0000024</a>.<br/> 
            </p>			
            <p><strong>7. In addition to INO, do you also use other ontologies in Ignet? </strong></p>
<p>Ignet was initiated by our literature mining and analysis of vaccine-induced interferon-gamma related gene interaction network (Reference: Ozgür et al. 2011, PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/21624163/">21624163</a>). In this study, we explored how the <a href="https://github.com/vaccineontology/VO">Vaccine Ontology (VO)</a> can help study to the vaccine-associated IFN-γ gene interaction networks. After the impressive research, we also explored how to use the VO-based literature mining for <em>Brucella</em> vaccine literature indexing and systematic analysis of gene-vaccine association network (Reference: Hur et al, 2011, PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/21871085/">21871085</a>). This is why you may see many vaccine related labels in Ignet. However, we can use other ontologies to study more specific research topics. For example, we can use the <a href="https://github.com/obophenotype/cell-ontology">Cell Ontology (CL)</a> to mine and analyze various cell types from the literature or other publication records such as the GEO text description. <br/> 
            </p>
								
            <p><strong>8. What are the meanings of different centrality scores calculated in Ignet? </strong></p>
<p>Four different centrality measures are used to calculate the importance of genes in the literature-mined gene-gene interaction network (Ref: <a href="https://academic.oup.com/bioinformatics/article/24/13/i277/236041?login=false">Ozgur et al, 2008</a>, and <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3102897/">Ozgur et al, 2011</a>). Degree centrality is the number of neighbors of a gene (i.e., the number of genes that the given gene interacts with). In eigenvector (PageRank) centrality, each neighbor contributes proportionally to its own centrality to the centrality of a gene. Closeness centrality is based on the geodesic distance of a gene to the other genes in the interaction network. A gene is considered to be more central, if it is closer to the other genes in the network. Betweenness centrality is based on the proportion of shortest paths between pairs of genes that pass over the given gene. A gene is more central, if it lies on many such paths in the network. <br/> 
            </p>		
	
            <p><strong>9. In addition to mining gene-gene interactions, could you also mine other types of gene interactions such as vaccine-gene interactions? </strong></p>
<p>Yes. As seen in our article: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3180695/">PMC3180695</a>), we previously developed our Vaccine Ontology (VO)-based SciMiner method (VO-SciMiner) to mine vaccine-gene interactions. As shown in the paper, our study showed that the usage of VO significantly improved our mining of vaccine-gene interactions. Furthermore, we have developed a VO-SciMiner program (<a href="https://www.violinet.org/vo-sciminer">https://www.violinet.org/vo-sciminer</a>) to demonstrate its usage for mining the interactions between <em>Brucella</em> vaccines and various genes. Similarly, we can change the Vaccine Ontology to another ontology such as Cell Ontology (CL) to mine the interactions between different cell types and genes. <br/> 
            </p>		
			
            <p><strong>10. How frequent is Ignet literature mining resource updated? Why I did not get any results when searching for "COVID-19"? </strong></p>
<p>Ignet was updated before the COVID-19 pandemic, which is why you won't get any results when searching for COVID-19. We are currently optimizing our automatic updating program and expect to have newly updated Ignet resource available for the public soon. <br/> 
            </p>		
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
