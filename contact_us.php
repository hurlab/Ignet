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
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
</head>
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
include('inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">
  <!-- InstanceBeginEditable name="Main" -->
    <h1 class="text-xl font-bold text-[#1a365d] mb-4">Contact Us</h1>

    <div class="grid md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white border border-gray-200 rounded-lg p-5">
        <h3 class="text-sm font-bold text-[#1a365d] mb-1"><a href="https://und.edu/directory/jung.hur" class="text-[#2b6cb0] hover:underline">Dr. Junguk Hur</a></h3>
        <p class="text-xs text-gray-600 leading-relaxed mb-1">Associate Professor</p>
        <p class="text-xs text-gray-600 leading-relaxed mb-1">Department of Biomedical Sciences, University of North Dakota, Grand Forks, ND, USA</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-5">
        <h3 class="text-sm font-bold text-[#1a365d] mb-1">General Inquiries</h3>
        <p class="text-xs text-gray-600 leading-relaxed mb-1">Email: <a href="mailto:hurlabshared@gmail.com" class="text-[#2b6cb0] hover:underline">hurlabshared@gmail.com</a></p>
        <p class="text-xs text-gray-600 leading-relaxed">Source: <a href="https://github.com/hurlab/Ignet" target="_blank" class="text-[#2b6cb0] hover:underline">github.com/hurlab/Ignet</a></p>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-5">
      <p class="text-sm text-gray-700 leading-relaxed">Please feel free to contact us for any suggestions, comments, and collaborations. Thanks!</p>
    </div>
  <!-- InstanceEndEditable -->
</main>
<?php include('inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
