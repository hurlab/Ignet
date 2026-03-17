<?php
ini_set('display_startup_errors', 0);
ini_set('display_errors', 0);
error_reporting(0);
include('../inc/functions.php');
include('../inc/redis_cache.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
<title>Ignet - BioSummarAI Search</title>
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
</head>
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
$redisCache  = getRedisCache();
$cacheKey    = 'ignet:gene_list_distinct';
$geneSymbols = array();

// Try to load gene list from Redis cache (TTL 24 hours)
$cachedGenes = $redisCache->get($cacheKey);
if ($cachedGenes !== null) {
    $geneSymbols = json_decode($cachedGenes, true) ?? [];
} else {
    try {
        $db   = ADONewConnection($driver);
        $conn = $db->Connect($host, $username, $password, $database);
        if (!$conn) {
            echo "database connection failed";
        }

        // USE THE SAME TABLE AS OLD WORKING VERSION!
        $strSql = "SELECT distinct geneSymbol1 FROM t_sentence_hit_gene2gene_Host order by geneSymbol1 LIMIT 50000";
        $rs     = $db->Execute($strSql);
        foreach ($rs as $row) {
            array_push($geneSymbols, $row['geneSymbol1']);
        }
        $rs->close();

        // Store in Redis for next requests (86400 s = 24 hours)
        if (!empty($geneSymbols)) {
            $redisCache->set($cacheKey, json_encode($geneSymbols), 86400);
        }
    } catch (Exception $e) {
        echo "error";
        print_r($e->getMessage());
    }
}
include('../inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">

  <div class="text-center mb-6">
    <h1 class="text-2xl font-bold text-[#1a365d] text-center mb-2">BioSummarAI</h1>
    <p class="text-sm text-gray-600 max-w-xl mx-auto">Search for gene-gene interaction summaries powered by AI. Select one or more gene symbols to retrieve literature-based summaries.</p>
  </div>

  <div class="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-5">

    <form action="searchgenes.php" method="POST">

      <div class="mb-4">
        <label class="block text-xs font-semibold text-gray-600 mb-1">Genes:</label>
        <select class="genes-multiple w-full border border-gray-300 rounded" name="genes[]" multiple="multiple">
          <?php
          foreach($geneSymbols as $symbol){
          ?>
            <option value="<?php echo htmlspecialchars($symbol); ?>"><?php echo htmlspecialchars($symbol); ?></option>
          <?php } ?>
        </select>
        <p class="text-xs text-gray-500 mt-1">Start typing to search the list, or enter new gene symbols separated by commas or spaces.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mt-5">
        <button type="submit" name="search_type" value="intersection"
          class="flex-1 bg-[#ed8936] hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
          Search Common
        </button>
        <button type="submit" name="search_type" value="union"
          class="flex-1 bg-[#1a365d] hover:bg-[#102a4c] text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
          Search Related
        </button>
      </div>

      <div class="mt-3 grid sm:grid-cols-2 gap-2">
        <p class="text-xs text-gray-500"><span class="font-semibold text-gray-700">Search Common:</span> Finds records containing ALL selected genes.</p>
        <p class="text-xs text-gray-500"><span class="font-semibold text-gray-700">Search Related:</span> Finds records containing ANY of the selected genes.</p>
      </div>

    </form>
  </div>

</main>
<?php include('../inc/template_footer.php'); ?>
<script>
$(document).ready(function() {
    $(".genes-multiple").select2({
        placeholder: "Select or type gene symbols...",
        tags: true,
        tokenSeparators: [',', ' ', '\n', '\t'],
        width: '400px'
    });
});
</script>
</body>
</html>
