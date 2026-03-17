<?php
include('inc/functions.php');
include('../../conf/config.php');
include('inc/redis_cache.php');
$db = NewADOConnection($driver);
$db->PConnect($host, $username, $password, $database);

// Allow cache bypass via ?nocache=1 (admin use)
$bypassCache = !empty($_GET['nocache']) && $_GET['nocache'] === '1';
$redisCache  = getRedisCache();

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
<link href="css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
</head>
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
include('inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">
  <!-- InstanceBeginEditable name="Main" -->
<?php
$strSql="(SELECT distinct genesymbol1 as linked_gene FROM t_sentence_hit_gene2gene where genesymbol2='ifng') UNION (SELECT distinct genesymbol2 as linked_gene FROM t_sentence_hit_gene2gene where genesymbol1='ifng');";
$rs=$db->Execute($strSql);
$num_genes=$rs->RecordCount();

$strSql="(SELECT distinct concat(genesymbol1, '__', genesymbol2) as pair FROM t_sentence_hit_gene2gene where in_ifng_network=1) UNION (SELECT distinct concat(genesymbol2, '__', genesymbol1) as pair FROM t_sentence_hit_gene2gene where in_ifng_network=1);";
$rs=$db->Execute($strSql);
$num_pairs=$rs->RecordCount();


$strSql="SELECT count(distinct sentenceID) as num_sentences FROM t_sentence_hit_gene2gene where in_ifng_network=1;";
$rs=$db->Execute($strSql);
$num_sentences=$rs->Fields('num_sentences');


$strSql="SELECT * FROM t_centrality_score_dignet order by score_type, score desc;";
$rs=$db->Execute($strSql);
$array_rank=array();
foreach($rs as $row) {
 	if (!isset($array_rank[$row['score_type']]) || !is_array($array_rank[$row['score_type']])) { $array_rank[$row['score_type']] = array(); }
	if ( !in_array($row['genesymbol'], (array)($array_rank[$row['score_type']] ?? []), true) ) {
		$array_rank[$row['score_type']][]=$row['genesymbol'];
	}
}

//Bin -- expensive aggregate stats, cached in Redis for 24 hours
$pmidCount = (!$bypassCache) ? $redisCache->get('ignet:stats:total_pmids') : null;
if ($pmidCount === null) {
    $strSql    = "SELECT count(distinct PMID) as pmidCount FROM t_sentence_hit_gene2gene;";
    $rs        = $db->Execute($strSql);
    $pmidCount = $rs->Fields("pmidCount");
    $redisCache->set('ignet:stats:total_pmids', (string) $pmidCount, 86400);
}

$sentenceCount = (!$bypassCache) ? $redisCache->get('ignet:stats:total_sentences') : null;
if ($sentenceCount === null) {
    $strSql        = "SELECT count(distinct sentenceID) as sentenceCount FROM t_sentence_hit_gene2gene;";
    $rs            = $db->Execute($strSql);
    $sentenceCount = $rs->Fields("sentenceCount");
    $redisCache->set('ignet:stats:total_sentences', (string) $sentenceCount, 86400);
}

$interactionCount = (!$bypassCache) ? $redisCache->get('ignet:stats:total_interactions') : null;
if ($interactionCount === null) {
    $strSql           = "SELECT count(*) as interactionCount FROM t_sentence_hit_gene2gene;";
    $rs               = $db->Execute($strSql);
    $interactionCount = $rs->Fields("interactionCount");
    $redisCache->set('ignet:stats:total_interactions', (string) $interactionCount, 86400);
}

$geneCount = (!$bypassCache) ? $redisCache->get('ignet:stats:total_genes') : null;
if ($geneCount === null) {
    $strSql = "
        SELECT count(distinct newTable.gene) as geneCount
        FROM
        (
            SELECT geneSymbol1 as gene FROM t_sentence_hit_gene2gene
            UNION
            SELECT geneSymbol2 as gene FROM t_sentence_hit_gene2gene
        ) newTable
        WHERE newTable.gene is not null;
    ";
    $rs        = $db->Execute($strSql);
    $geneCount = $rs->Fields("geneCount");
    $redisCache->set('ignet:stats:total_genes', (string) $geneCount, 86400);
}

?>

  <h1 class="text-xl font-bold text-[#1a365d] mb-4">Database Statistics</h1>

  <p class="text-sm text-gray-700 mb-4">Ignet has analyzed abstracts from millions of publications available in PubMed.</p>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white border border-gray-200 rounded-lg p-5 text-center">
      <p class="text-2xl font-bold text-[#1a365d]"><?php echo htmlspecialchars($interactionCount, ENT_QUOTES, 'UTF-8') ?></p>
      <p class="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">Gene-Gene Interactions</p>
    </div>
    <div class="bg-white border border-gray-200 rounded-lg p-5 text-center">
      <p class="text-2xl font-bold text-[#1a365d]"><?php echo htmlspecialchars($sentenceCount, ENT_QUOTES, 'UTF-8') ?></p>
      <p class="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">Sentences</p>
    </div>
    <div class="bg-white border border-gray-200 rounded-lg p-5 text-center">
      <p class="text-2xl font-bold text-[#1a365d]"><?php echo htmlspecialchars($pmidCount, ENT_QUOTES, 'UTF-8') ?></p>
      <p class="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">PubMed Publications</p>
    </div>
    <div class="bg-white border border-gray-200 rounded-lg p-5 text-center">
      <p class="text-2xl font-bold text-[#1a365d]"><?php echo htmlspecialchars($geneCount, ENT_QUOTES, 'UTF-8') ?></p>
      <p class="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">Unique Human Genes</p>
    </div>
  </div>

  <div class="bg-white border border-gray-200 rounded-lg p-5 mb-6">
    <h2 class="text-sm font-bold text-[#1a365d] mb-2">IFNG Network Example</h2>
    <p class="text-sm text-gray-700">
      <?php echo htmlspecialchars($num_genes, ENT_QUOTES, 'UTF-8') ?> genes are associated with IFNG in the database.
    </p>
    <!-- <p><?php echo $num_pairs?> interactions detected in the IFNG interaction network. </p> -->
    <!-- <p><?php echo $num_sentences?> interaction sentences have been found and visualized in Ignet.</p> -->
  </div>

  <div class="bg-white border border-gray-200 rounded-lg p-5">
    <h2 class="text-sm font-bold text-[#1a365d] mb-3">Top 50 Genes Ranked by Centrality Score</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-xs font-semibold text-gray-600 uppercase tracking-wide text-left px-3 py-2">Rank</th>
            <th class="text-xs font-semibold text-gray-600 uppercase tracking-wide text-left px-3 py-2">Degree Centrality</th>
            <th class="text-xs font-semibold text-gray-600 uppercase tracking-wide text-left px-3 py-2">Eigenvector Centrality</th>
            <th class="text-xs font-semibold text-gray-600 uppercase tracking-wide text-left px-3 py-2">Closeness Centrality</th>
            <th class="text-xs font-semibold text-gray-600 uppercase tracking-wide text-left px-3 py-2">Betweenness Centrality</th>
          </tr>
        </thead>
        <tbody>
          <?php
          for ($i=0; $i<50; $i++) {
          ?>
          <tr class="even:bg-gray-50 border-t border-gray-100">
            <td class="px-3 py-2 text-gray-500 font-medium"><?php echo $i+1?></td>
            <td class="px-3 py-2 text-gray-700"><?php echo htmlspecialchars($array_rank['d'][$i], ENT_QUOTES, 'UTF-8')?></td>
            <td class="px-3 py-2 text-gray-700"><?php echo htmlspecialchars($array_rank['p'][$i], ENT_QUOTES, 'UTF-8')?></td>
            <td class="px-3 py-2 text-gray-700"><?php echo htmlspecialchars($array_rank['c'][$i], ENT_QUOTES, 'UTF-8')?></td>
            <td class="px-3 py-2 text-gray-700"><?php echo htmlspecialchars($array_rank['b'][$i], ENT_QUOTES, 'UTF-8')?></td>
          </tr>
          <?php
          }
          ?>
        </tbody>
      </table>
    </div>
  </div>

  <!-- InstanceEndEditable -->
</main>
<?php include('inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
