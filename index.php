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
<link href="css/bmain.css" rel="stylesheet" type="text/css">
<style type="text/css">
<!--
.style1 {
	font-size: 18px;
	font-weight: bold;
}
.style2 {font-size: 18px}
-->
.warning {
    color: red; /* Changed color to red */
    font-weight: bold;
    font-size: 1.2em;
    margin-bottom: 10px;
}
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
				<div style="text-align:left;">
   <p> Welcome to Ignet! </p>
				</div>

		<p class="warning">
			Dignet search issue has been fixed. We recommend reruning your Dignet searches.
<!--
			<br>
			<?php
				date_default_timezone_set('America/Chicago'); // Set the timezone to CDT
				echo "Today's Date and Time (CDT): " . date("F j, Y, g:i a T");
			?>
-->
		</p>
     
		<p>The <strong>Ignet</strong> (<strong>I</strong>ntegrative <strong>g</strong>ene <strong>net</strong>work) project is a centrality- and ontology-based liteature discovery system for analyzing and visualizing biological gene interaction networks using all PubMed literature papers. By mining all human genes defined in the <a href="https://www.genenames.org/">HUGO human gene nomenclature</a>, Ignet focuses on the literature mining of human gene interaction networks. The original Ignet emphasized vaccine-associated human gene interaction mining; however, current Ignet is domain-neutral and covers all kinds of domains. </p>	
			
		<p>Ignet uses <a href="https://pubmed.ncbi.nlm.nih.gov/19188191/">SciMiner</a> as its default NLP program. SciMiner is a dictionary- and rule-based literature mining program that has been proven effective in scientific literature mining. SciMiner has been optimized to mine genes/proteins and gene-gene interactions from the literature.</p>	
			
        <p>The Ignet system uses ontology to enhance its NLP and analysis performance. Ignet uses the Interaction Network Ontology (<a href="https://github.com/INO-ontology/ino">INO</a>), a formal ontology in the domain of interactions and interaction networks (Ref: <a href="http://www.ncbi.nlm.nih.gov/pubmed/28031747">Ozgur et al, 2016</a>). The INO ontology classifies different types of interactions in a hierarchical matter. By using INO, we can not only identify specific gene-gene interaction types, but also classify different interaction groups. In addition, we have also used the Vaccine Ontology (<a href="https://github.com/vaccineontology/VO">VO</a>), a biomedical ontology in the domain of vaccinology (Ref: <a href="https://pubmed.ncbi.nlm.nih.gov/21871085/">Hur et al, 2011</a>).</p> 
									
		<p>Using the identified network of gene-gene interactions, Ignet calculates four types of centrality scores: Degree centrality, Eigenvector centrality, Closeness centrality, and Betweenness centrality. Each type of centrality measures a specific centrality role of a targeted node (e.g., gene) (Ref: <a href="https://academic.oup.com/bioinformatics/article/24/13/i277/236041?login=false">Ozgur et al, 2008</a>). </p> 	
			
        <!-- p>It is noted that the Ignet database contains gene interactions identified with PubMed papers published unitl the end of 2011. We are still processing the literature papers published since 2012. </p -->
			
        <p>Ignet provides three programs to support the network analysis: <a href="/ignet/gene/index.php"><strong>Gene</strong></a>, <a href="/ignet/genepair/index.php"><strong>GenePair</strong></a>, and <a href="/ignet/dignet/index.php"><strong>Dignet</strong></a> (Dynamic Ignet). Gene and GenePair allows users to construct and explore the gene interaction networks centered on individual gene or a gene pair, respectively. Dignet allows construction of gene interaction networks for a specific domain, defined by users' PubMed query.</p>
			
        <p>More development is underway. For example, we have been evaluating machine learning methods for our integrated gene network mining and analysis. Please feel free to <a href="contact_us.php">contact us</a> for any comments, feedbacks, and collaborations!</p>			
			
        <p>A journal article about Ignet is currently under preparation. To cite Ignet now, please use the following conference proceeding article:
          <!-- p>The development of the Ignet system was inactive for a few years, but has been active recently (in 2022). Your <a href="contact_us.php">feedbacks</a> are more than welcome and appreciated!</p>
  <p><strong>Cite Ignet: </strong> </p -->
        <blockquote>
        <p>Ozgur A, Hur J, Xiang Z, Ong E, Radev D, and He Y. Ignet: A centrality and INO-based web system for analyzing and visualizing literature-mined networks. August 1-2, 2016, joint session ICBO+BioCreative, at the <em>International Conference on Biomedical Ontologies (ICBO-2016) </em>and <em>BioCreative 2016</em>, August 1-4, 2016, Oregon State University, Corvallis, OR, USA. 2-page proceeding paper (<a href="http://ceur-ws.org/Vol-1747/BP01_ICBO2016.pdf">http://ceur-ws.org/Vol-1747/BP01_ICBO2016.pdf</a>). </p></blockquote>
		
		<p> Ignet is co-developed by three groups led by Dr. Yongqun "Oliver" He at the University of Michigan, USA, Dr. Junguk Hur at the University of North Dakoda, USA, and Dr. Arzucan Özgür from Bogazici University, Turkey. See more references from our colloborative groups from the <a href="/ignet/docs/docs.php">Documents page</a>.</p>		       
<br/>
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
</script> <!-- InstanceEnd --></html>
