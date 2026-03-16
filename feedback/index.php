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
<body style="margin:0px; background-image:url(/images/bg_2008-08-21.2.gif)" id="main_body">
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
      <form action="feedback_submit.php" method="post" name="SubmitFeedbackForm" id="SubmitFeedbackForm">
        <h3>Feedback</h3>
        <p>Submitting feedback to the Ignet team allows us to enhance the system for the best possible user experience. Please take a few minutes to let us know what you think. You may be contacted via email from us. Thank you.</p>
		<table border="0" cellpadding="4" cellspacing="0">
          <tr>
            <td>Category: </td>
            <td><select name="c_category">
                <option value="Query">Query</option>
                <option value="Analysis">Analysis</option>
                <option value="Suggestion">Suggestion</option>
                <option value="Correction">Correction</option>
                <option value="Errors">Errors</option>
                <option value="Other">Other</option>
              </select></td>
          </tr>
          <tr>
            <td>E-mail:</td>
            <td><input name="c_email" maxlength="100" size="60" value="" type="text" /></td>
          </tr>
          <tr>
            <td>Subject:</td>
            <td><input name="c_subject" maxlength="200" size="120" value="" type="text" /></td>
          </tr>
          <tr>
            <td>Message Body:</td>
            <td><textarea name="c_body" cols="120" rows="4"></textarea></td>
          </tr>
          <tr>
            <td colspan="2" align="center"><input name="submit" type="submit" value="Submit" />
              
            <input type="button" name="Button" value="Cancel" onclick="window.location.href='../index.php'" style="margin-left:60px;"/></td>
          </tr>
        </table>
      </form>
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
