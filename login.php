<!DOCTYPE html>
<html lang="en"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet - Sign In</title>
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

  <div class="max-w-sm mx-auto py-12">
    <h1 class="text-xl font-bold text-[#1a365d] text-center mb-6">Sign In to Ignet</h1>

    <div id="login-form" class="bg-white border border-gray-200 rounded-lg p-6 mb-4">
      <div class="mb-4">
        <label for="email" class="block text-xs font-semibold text-gray-600 mb-1">Email</label>
        <input type="email" id="email" placeholder="you@university.edu" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
      </div>
      <div class="mb-4">
        <label for="password" class="block text-xs font-semibold text-gray-600 mb-1">Password</label>
        <input type="password" id="password" placeholder="Min. 8 characters" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
      </div>
      <button onclick="doLogin()" class="w-full bg-[#1a365d] hover:bg-[#102a4c] text-white py-2 rounded text-sm font-medium transition">Sign In</button>
      <div id="login-msg" class="text-xs text-center mt-3 hidden"></div>
    </div>

    <div class="text-center text-sm text-gray-500 mb-4">
      Don't have an account? <a href="#" onclick="showRegister(); return false;" class="text-[#2b6cb0] hover:underline">Create one</a>
    </div>

    <div id="register-form" class="bg-white border border-gray-200 rounded-lg p-6 hidden">
      <h2 class="text-sm font-bold text-gray-700 mb-4">Create Account</h2>
      <div class="mb-3">
        <label for="reg-email" class="block text-xs font-semibold text-gray-600 mb-1">Email</label>
        <input type="email" id="reg-email" placeholder="you@university.edu" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
      </div>
      <div class="mb-3">
        <label for="reg-password" class="block text-xs font-semibold text-gray-600 mb-1">Password</label>
        <input type="password" id="reg-password" placeholder="Min. 8 characters" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
      </div>
      <button onclick="doRegister()" class="w-full bg-[#38a169] hover:bg-green-600 text-white py-2 rounded text-sm font-medium transition">Create Account</button>
      <div id="register-msg" class="text-xs text-center mt-3 hidden"></div>
    </div>

    <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6">
      <h3 class="text-xs font-bold text-[#1a365d] mb-1">Why create an account?</h3>
      <ul class="text-xs text-gray-600 space-y-1">
        <li>Save your searches and networks</li>
        <li>Extended LLM chat (20 messages per session)</li>
        <li>Bring Your Own API Key (BYOK) for premium LLM models</li>
        <li>500 queries/day (vs 100 for public access)</li>
      </ul>
    </div>
  </div>

  <script>
  const API = '/ignet/api/venv/../run.py'; // Placeholder
  const API_BASE = window.location.origin + ':9637/api/v1';

  function showRegister() {
    document.getElementById('register-form').classList.toggle('hidden');
  }

  async function doLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('login-msg');
    try {
      const resp = await fetch(API_BASE + '/auth/login', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });
      const data = await resp.json();
      if (resp.ok && data.token) {
        localStorage.setItem('ignet_token', data.token);
        localStorage.setItem('ignet_user', JSON.stringify(data.user));
        msg.textContent = 'Signed in! Redirecting...';
        msg.className = 'text-xs text-center mt-3 text-green-600';
        msg.classList.remove('hidden');
        setTimeout(() => window.location.href = '/ignet/index.php', 1000);
      } else {
        msg.textContent = data.message || 'Invalid credentials';
        msg.className = 'text-xs text-center mt-3 text-red-600';
        msg.classList.remove('hidden');
      }
    } catch(e) {
      msg.textContent = 'Could not connect to API';
      msg.className = 'text-xs text-center mt-3 text-red-600';
      msg.classList.remove('hidden');
    }
  }

  async function doRegister() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('register-msg');
    try {
      const resp = await fetch(API_BASE + '/auth/register', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });
      const data = await resp.json();
      if (resp.ok && data.token) {
        localStorage.setItem('ignet_token', data.token);
        localStorage.setItem('ignet_user', JSON.stringify(data.user));
        msg.textContent = 'Account created! Redirecting...';
        msg.className = 'text-xs text-center mt-3 text-green-600';
        msg.classList.remove('hidden');
        setTimeout(() => window.location.href = '/ignet/index.php', 1000);
      } else {
        msg.textContent = data.message || 'Registration failed';
        msg.className = 'text-xs text-center mt-3 text-red-600';
        msg.classList.remove('hidden');
      }
    } catch(e) {
      msg.textContent = 'Could not connect to API';
      msg.className = 'text-xs text-center mt-3 text-red-600';
      msg.classList.remove('hidden');
    }
  }
  </script>

  <!-- InstanceEndEditable -->
</main>
<?php include('inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
