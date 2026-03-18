<header class="bg-[#1a365d] shadow-md">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex items-center justify-between h-14">
      <div class="flex items-center gap-1">
        <a href="/ignet/index.php" class="text-xl font-bold text-white tracking-tight hover:text-blue-200 mr-4">Ignet</a>
        <nav class="hidden md:flex items-center">
          <a href="/ignet/dignet/index.php" class="px-2.5 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded transition">Network Search</a>
          <a href="/ignet/analyze.php" class="px-2.5 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded transition relative">Analyze Text<sup class="ml-0.5 text-[10px] text-orange-300 font-bold">NEW</sup></a>
          <a href="/ignet/gene/index.php" class="px-2.5 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded transition">Gene</a>
          <a href="/ignet/genepair/index.php" class="px-2.5 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded transition">GenePair</a>
          <a href="/ignet/biosummarAI/index.php" class="px-2.5 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded transition">BioSummarAI</a>
          <a href="/ignet/explore.php" class="px-2.5 py-1.5 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded transition relative">Explore<sup class="ml-0.5 text-[10px] text-orange-300 font-bold">NEW</sup></a>
        </nav>
      </div>
      <div class="flex items-center gap-3">
        <form action="/ignet/dignet/searchPubmed.php" method="post" class="hidden sm:flex items-center gap-2">
          <input type="text" name="keywords" placeholder="Search PubMed (e.g., vaccine, IFNG)"
                 class="px-3 py-1.5 rounded text-gray-900 text-sm w-52 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          <button type="submit" name="submit" value="GO"
                  class="bg-[#ed8936] hover:bg-orange-500 text-white px-3 py-1.5 rounded text-sm font-medium transition">Go</button>
        </form>
        <a href="/ignet/" class="text-xs text-emerald-300 hover:text-emerald-100 font-medium transition">v2.0</a>
        <a href="/ignet/login.php" class="text-sm font-medium text-blue-100 hover:text-white border border-blue-300/40 px-3 py-1 rounded transition hover:bg-white/10">Sign In</a>
      </div>
    </div>
  </div>
</header>
