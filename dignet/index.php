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
		<h3 align="center">Dynamic Ignet Search Program!</h3>
        <!--p>Search Ignet</p>
        <form action="search.php" >
          <table border="0" cellpadding="4">
            <tr>
              <td bgcolor="#E4E4E4" class="styleLeftColumn">Keywords: </td>
              <td class="tdData"><label for="keywords1"></label>
              <input type="text" name="keywords" id="keywords1" /></td>
              <td align="center"><input type="submit" name="Submit" value="Search" /></td>
            </tr>
          </table>
        </form-->
        
	        
        <p>Keywords Search (e.g., "vaccine", "diabetes", or "<em>Brucella</em>"). <em>Note</em> that this function will search PubMed, extract the results from&nbsp;the PubMed search engine, and then use our own Dignet engine to process the gene interaction&nbsp; results.</p>
        <form action="searchPubmed.php" >
          <table border="0" cellpadding="4">
            <tr>
              <td bgcolor="#E4E4E4" class="styleLeftColumn">Keywords: </td>
              <td class="tdData"><label for="keywords2"></label>
                <input type="text" name="keywords" id="keywords2" /></td>
              <td align="center"><input type="submit" name="Submit2" value="Search" /></td>
            </tr>
          </table>
        </form>
        <p></p>
        <p>&nbsp;</p>
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
