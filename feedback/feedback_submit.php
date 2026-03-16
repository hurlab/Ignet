<?php 
include ('../inc/functions.php');
?>
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
      <?php 

$vali=new Validation($_REQUEST);

$c_email = $vali->getEmail('c_email', 'Email Address', true);
$c_subject = $vali->getInput('c_subject', 'Subject', 2, 200);
$c_category = $vali->getInput('c_category', 'Category', 2, 45);
$c_body = $vali->getInput('c_body', 'Message body', 2, 6000);
$c_submit_ip = $_SERVER['REMOTE_ADDR'];
if (strlen($vali->getErrorMsg())>0) {
?>
      <p align="center"> Something wrong with your input. Please check the following fields:<br />
        <font color="red">
        <?php echo $vali->getErrorMsg()?>
        </font> <a href="javascript:history.go(-1);">Go back and try again</a>. </p>
      <?php 	
}
else {
	$db = ADONewConnection($driver);
	$db->Connect($host, $username, $password, $database);

	$c_feedback_key = date('YmdHis').createRandomPassword();
	$strSql = "INSERT INTO t_feedback (c_email, c_subject, c_category, c_body, c_submit_time, c_submit_ip, c_feedback_key) VALUES(";
	$strSql .= $db->qstr($c_email);
	$strSql .= ", " . $db->qstr($c_subject);
	$strSql .= ", " . $db->qstr($c_category);
	$strSql .= ", " . $db->qstr($c_body);
	$strSql .= ", CURDATE()";
	$strSql .= ", " . $db->qstr($c_submit_ip);
	$strSql .= ", " . $db->qstr($c_feedback_key) . ")";

	if ($db->Execute($strSql)) {
		include('Mail.php');
	
		$headers['From']    = $c_email;
		$headers['Reply-To'] = $c_email;
		$headers['Date']      = date('r (T)');
		$headers['To']      = $adminEmail;
		$headers['Subject'] = $systemEmailFlag . "Feedback ($c_category): ". $c_subject;
		$headers['Content-Type']      = "text/html; charset=iso-8859-1";
		$body = "<html></p>".htmlspecialchars($c_body)."</p>";
		$body .= "</html>";
		$params['host'] = $mail_relay_host;
		// Create the mail object using the Mail::factory method
		$mail_object =& Mail::factory('smtp', $params);
		$mail_object->send($headers['To'], $headers, $body);
		
?>
      <p align="center" class="notice">Feedback submitted. Thank you very much for your support!</p>
		  <p align="center"><a href="../index.php">Go back to home page</a>.</p>
      <?php 
	}
	else {
?>
      <p align="center" class="notice"> Something wrong with our server.</p>
      <p align="center">Please contact our <a href="mailto:<?php echo $webmasterEmail?>?subject=<?php echo $systemEmailFlag?>Registration Problem">webmaster</a>! </p>
      <?php 
	}
}

?>
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
