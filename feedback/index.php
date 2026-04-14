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
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
