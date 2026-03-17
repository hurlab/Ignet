<?php 
include ('../inc/functions.php');
?>
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
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
