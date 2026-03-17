<?php 
include('../inc/functions.php');
ini_set('memory_limit', '512M');

// Define constants for timeout and PMID limits
if (!defined('IGNET_EUTILS_TIMEOUT')) define('IGNET_EUTILS_TIMEOUT', 25); // seconds per edirect call
if (!defined('IGNET_MAX_PMIDS_POOL')) define('IGNET_MAX_PMIDS_POOL', 1000); // max PMIDs to process
if (!defined('IGNET_NCBI_API_KEY'))   define('IGNET_NCBI_API_KEY', ''); // optional NCBI API key

@ini_set('default_socket_timeout', 10);
@set_time_limit(120);

$db = NewADOConnection($driver);
$db->PConnect($host, $username, $password, $database);

// use your server's clock (America/Chicago) to stamp this run
$now = date('Y-m-d H:i:s');

if (!empty($_GET['download']) && !empty($_GET['c_query_id'])) {
    // 1) Fetch both the stored PMID string and the original query text
    $qid = $db->qstr($_GET['c_query_id']);
    $row = $db->GetRow("
      SELECT c_query_text, c_pubmed_records
        FROM t_pubmed_query
       WHERE c_query_id = {$qid}
    ");
    if (!$row) {
        header('HTTP/1.1 404 Not Found');
        exit("No such query ID");
    }

    // 2) Sanitize the query text into a Windows/Unix-safe filename fragment
    $rawText = $row['c_query_text'];
    // replace any non‐word (letter/number/underscore) or hyphen with underscore
    $safeText = preg_replace('/[^\w-]/u', '_', $rawText);
    // collapse multiple underscores, trim to a reasonable length
    $safeText = preg_replace('/_+/', '_', $safeText);
    if (function_exists('mb_substr')) {
        $safeText = mb_substr($safeText, 0, 50, 'UTF-8');
    } else {
        $safeText = substr($safeText, 0, 50);
    }

    // 3) Handle the two download types
    if ($_GET['download'] === 'pmids') {
        $pmids = explode(',', $row['c_pubmed_records']);

        header('Content-Type: text/plain; charset=utf-8');
        header('Content-Disposition: attachment; '
             . "filename=\"pubmed_ids_{$safeText}.txt\"");

        foreach ($pmids as $pmid) {
            echo trim($pmid), "\n";
        }
        exit;
    }

    if ($_GET['download'] === 'table') {
        $pmids = explode(',', $row['c_pubmed_records']);

        // rebuild your gene_pairs as before...
        $rs = $db->Execute("
          SELECT geneSymbol1, geneSymbol2
            FROM t_sentence_hit_gene2gene_Host
           WHERE pmid IN (" . join(',', array_map('intval', $pmids)) . ")
        ");
        $gene_pairs = [];
        foreach ($rs as $r) {
            $k1 = "{$r['geneSymbol1']}---{$r['geneSymbol2']}";
            $k2 = "{$r['geneSymbol2']}---{$r['geneSymbol1']}";
            if      (isset($gene_pairs[$k1])) $gene_pairs[$k1]++;
            elseif  (isset($gene_pairs[$k2])) $gene_pairs[$k2]++;
            else                              $gene_pairs[$k1] = 1;
        }

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; '
             . "filename=\"gene_pairs_{$safeText}.csv\"");

        echo "Gene1,Gene2,Hits\n";
        foreach ($gene_pairs as $pair => $hits) {
            list($g1, $g2) = explode('---', $pair);
            echo "\"{$g1}\",\"{$g2}\",{$hits}\n";
        }
        exit;
    }
}

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
<h3> Dignet Gene Interaction Search</h3>
<p>Dignet dynamically searches PubMed over the provided keyword(s), retrieves and stores relevant PubMed IDs, and identifies genes and gene interactions from the related PubMed paper abstracts. <em>Note</em> that the Ignet engine may have not yet processed most recent abstracts, so most recent results may not show up. </p> 

<?php 
$vali=new Validation($_REQUEST);
$keywords = $vali->getInput('keywords', 'Keywords', 2, 60);
if ($keywords === '') {
    echo "<p style='color:red;'>Keywords is missing or invalid!</p>";
    exit;
}

$c_query_id = createRandomPassword();

$arrayPubmedID =  array();
$strSql = "SELECT * FROM t_pubmed_query where c_query_text=" . $db->qstr($keywords);
$rs = $db->Execute($strSql);			


// 1) Decide if we must re-fetch: no row yet, or ts ≥ 7 days old
$needFetch = $rs->EOF;
if (! $rs->EOF) {
    $lastTs  = new DateTime($rs->Fields('c_query_ts'));
    $ageDays = (new DateTime($now))->diff($lastTs)->days;
    if ($ageDays >= 7) {
        $needFetch = true;
    }
}

if ($needFetch) {
    // ─── FRESH FETCH PATH WITH OPTIMIZATIONS ───
    
    // 1) ensure your tmp directory exists
    $tmpDir = __DIR__ . '/tmp';
    if (! is_dir($tmpDir)) {
        mkdir($tmpDir, 0755, true);
    }

    // 2) get a unique filename in ./tmp
    $tmpFile = tempnam($tmpDir, 'esearch_') . '.xml';

    // 3) Build esearch command with timeout
    $esearchCmd  = 'timeout ' . IGNET_EUTILS_TIMEOUT . ' /usr/local/edirect/esearch -db pubmed -query ';
    $esearchCmd .= escapeshellarg($keywords);
    
    // Add API key if available
    if (IGNET_NCBI_API_KEY !== '') {
        $esearchCmd .= ' -api_key ' . escapeshellarg(IGNET_NCBI_API_KEY);
    }
    
    $esearchCmd .= ' > ' . escapeshellarg($tmpFile) . ' 2>&1';
    
    $esearchOutput = shell_exec($esearchCmd);
    $esearchExitCode = 0;
    exec($esearchCmd, $dummyOutput, $esearchExitCode);

    // 4) Check if the esearch failed or timed out
    if ($esearchExitCode === 124) {
        echo "<p style='color:red;'>Error: PubMed search timed out after " . IGNET_EUTILS_TIMEOUT . " seconds. Please refine your query.</p>";
        if (file_exists($tmpFile)) {
            unlink($tmpFile);
        }
        exit;
    }
    
    if (!file_exists($tmpFile) || filesize($tmpFile) == 0) {
        echo "<p style='color:red;'>Error: PubMed search failed. Please check your query and try again.</p>";
        if (file_exists($tmpFile)) {
            unlink($tmpFile);
        }
        exit;
    }

    // 5) Parse the XML to check count
    $xmlContent = file_get_contents($tmpFile);
    try {
        $xml = @simplexml_load_string($xmlContent);
        if ($xml === false) {
            $errors = libxml_get_errors();
            libxml_clear_errors();
            echo "<p style='color:red;'>Error: Invalid response from PubMed. Please try again.</p>";
            unlink($tmpFile);
            exit;
        }
        
        // Check the Count value
        $count = (int)$xml->Count;
        if ($count === 0) {
            echo "<p style='color:orange;'>No results found for query: <strong>" . htmlspecialchars($keywords) . "</strong></p>";
            echo "<p>Please try different keywords or check your spelling.</p>";
            unlink($tmpFile);
            exit;
        }
        
        // Check if count exceeds reasonable limit
        if ($count > 100000) {
            echo "<p style='color:red;'><strong>Warning:</strong> Your query returned <strong>" . number_format($count) . "</strong> PubMed records, which exceeds the processing limit of <strong>100,000</strong>.</p>";
            echo "<p>Please refine your query: <strong>" . htmlspecialchars($keywords) . "</strong> to be more specific.</p>";
            echo "<p><em>Suggestion:</em> Add more specific terms, date ranges, or use Boolean operators (AND, OR, NOT).</p>";
            unlink($tmpFile);
            exit;
        }
        
        // Show warning if processing will be chunked
        if ($count > IGNET_MAX_PMIDS_POOL) {
            echo "<p style='color:blue;'><strong>Note:</strong> Your query returned <strong>" . number_format($count) . "</strong> records. ";
            echo "Processing the first <strong>" . number_format(IGNET_MAX_PMIDS_POOL) . "</strong> most relevant results to ensure fast response time.</p>";
        }
        
    } catch (Exception $e) {
        echo "<p style='color:red;'>Error processing PubMed response: " . htmlspecialchars($e->getMessage()) . "</p>";
        if (file_exists($tmpFile)) {
            unlink($tmpFile);
        }
        exit;
    }

    // 6) Fetch UIDs with timeout and limit
    // Use efetch with retmax to limit the number of PMIDs
    $retmax = min($count, IGNET_MAX_PMIDS_POOL);
    
    $efetchCmd  = 'timeout ' . IGNET_EUTILS_TIMEOUT . ' cat ' . escapeshellarg($tmpFile) 
               . ' | /usr/local/edirect/efetch -format uid -stop ' . $retmax;
    
    if (IGNET_NCBI_API_KEY !== '') {
        $efetchCmd .= ' -api_key ' . escapeshellarg(IGNET_NCBI_API_KEY);
    }
    
    $efetchCmd .= ' 2>&1';

    // use exec() so we can capture the exit code as well as output lines
    $outputLines = [];
    $returnCode  = 0;
    exec($efetchCmd, $outputLines, $returnCode);
    
    // Check for timeout
    if ($returnCode === 124) {
        echo "<p style='color:red;'>Error: PubMed ID retrieval timed out after " . IGNET_EUTILS_TIMEOUT . " seconds.</p>";
        if (file_exists($tmpFile)) {
            unlink($tmpFile);
        }
        exit;
    }

    // 7) parse directly from $outputLines
    $arrayPubmedID = array_filter(
        array_map('trim', $outputLines),
        function($id) { return ctype_digit($id) && strlen($id) > 0; }
    );
    
    // Ensure we don't exceed the pool cap
    if (count($arrayPubmedID) > IGNET_MAX_PMIDS_POOL) {
        $arrayPubmedID = array_slice($arrayPubmedID, 0, IGNET_MAX_PMIDS_POOL);
    }

    // 8) Clean up temp file
    if (file_exists($tmpFile)) {
        unlink($tmpFile);
    }

    // 9) Insert into the Ignet database
    if (empty($arrayPubmedID)) {
        echo "<p style='color:orange;'>No PubMed IDs retrieved for query: <strong>" . htmlspecialchars($keywords) . "</strong></p>";
        echo "<p>This could mean the abstracts are too recent and haven't been processed yet, or there was a retrieval error.</p>";
        exit;
    } else {
        // build comma-separated string
        $pubmedIDStr = implode(',', $arrayPubmedID);
        $numPubIDs   = count($arrayPubmedID);

        // sanitize and quote your values
        $qKeywords    = $db->qstr($keywords);
        $qPubmedList  = $db->qstr($pubmedIDStr);
        $qQueryId     = $db->qstr($c_query_id);
        $qQueryTS     = $db->qstr($now);
        
        // Check if we need to update or insert
        if (!$rs->EOF) {
            // Update existing record
            $strSql = "
              UPDATE t_pubmed_query
              SET c_query_id = $qQueryId,
                  c_num_pubmed_records = $numPubIDs,
                  c_pubmed_records = $qPubmedList,
                  c_query_ts = $qQueryTS
              WHERE c_query_text = $qKeywords
            ";
        } else {
            // Insert new record
            $strSql = "
              INSERT INTO t_pubmed_query
                (c_query_text, c_query_id, c_num_pubmed_records, c_pubmed_records, c_query_ts)
              VALUES
                ($qKeywords, $qQueryId, $numPubIDs, $qPubmedList, $qQueryTS)
            ";
        }
        $db->Execute($strSql);
    }
    
} else {
    // ─── CACHE REUSE PATH ───
    $arrayPubmedID	= explode(",", $rs->Fields('c_pubmed_records'));
    $numPubIDs     	= count($arrayPubmedID);
    $c_query_id		= $rs->Fields('c_query_id');
    
    echo "<p style='color:green;'><em>Using cached results from previous search (less than 7 days old).</em></p>";
}


// 3) Always log into history
$db->Execute("
  INSERT INTO t_pubmed_query_history
    (c_query_text, c_num_pubmed_records)
  VALUES
    (" . $db->qstr($keywords) . ", {$numPubIDs})
");


if (!empty($arrayPubmedID)) {
    // Process in chunks to avoid query size issues
    $chunkSize = 500;
    $gene_pairs = array();
    
    foreach (array_chunk($arrayPubmedID, $chunkSize) as $pmidChunk) {
        $strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene_Host WHERE pmid IN (".join(",", $pmidChunk) .")";
        
        $rs = $db->Execute($strSql);

        foreach ($rs as $row) {
            if (isset($gene_pairs[$row['geneSymbol1'].'---'.$row['geneSymbol2']])) {
                $gene_pairs[$row['geneSymbol1'].'---'.$row['geneSymbol2']]++;
            } elseif (isset($gene_pairs[$row['geneSymbol2'].'---'.$row['geneSymbol1']])){
                $gene_pairs[$row['geneSymbol2'].'---'.$row['geneSymbol1']]++;
            } else {
                $gene_pairs[$row['geneSymbol1'].'---'.$row['geneSymbol2']]=1;
            }
        }
    }

    if (!empty($gene_pairs)){	

?>

<p><strong>Keywords:</strong> <?php echo htmlspecialchars($keywords)?>.</p>
<p><strong>Results:</strong> Found <?php echo number_format(sizeof($gene_pairs))?> gene pairs from <?php echo number_format($numPubIDs)?> PubMed records.  </p>
<p><a href="displayNetwork.php?c_query_id=<?php echo urlencode($c_query_id)?>" target="_blank">Show network in Cytoscape Web</a>.</p>
<p><a href="loadScoresPubmed.php?c_query_id=<?php echo urlencode($c_query_id)?>" target="_blank">Calculate centrality scores</a>.</p>

<!-- hidden download target -->
<iframe name="downloadFrame" style="display:none;"></iframe>
<p>
  <a href="?keywords=<?php echo urlencode($keywords) ?>&c_query_id=<?php echo urlencode($c_query_id) ?>&download=pmids">
    Download PubMed IDs (<?php echo number_format($numPubIDs) ?>) 
  </a>
  |
  <a href="?keywords=<?php echo urlencode($keywords) ?>&c_query_id=<?php echo urlencode($c_query_id) ?>&download=table">
    Download the Table
  </a>
</p>

<table border="0" cellpadding="2" cellspacing="2" style="width:100%; border-collapse: collapse;">
  <tr>
	<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn" style="padding:5px;"><strong>#</strong></td>
	<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn" style="padding:5px;"><strong>Gene 1</strong></td>
	<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn" style="padding:5px;"><strong>Gene 2</strong></td>
	<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn" style="padding:5px;"><strong>Number of hits</strong></td>
  </tr>
<?php 
    ksort($gene_pairs);
    $i=0;
    foreach ($gene_pairs as $gene_pair=>$num_hits) {
        $tokens=preg_split('/---/', $gene_pair);
        $i++;
?>
  <tr>
	<td bgcolor="#F5FAF7" style="font-size:12px; padding:5px;"><?php echo $i?></td>
	<td bgcolor="#F5FAF7" style="font-size:12px; padding:5px;"><a href="geneDetail.php?geneSymbol1=<?php echo urlencode($tokens[0])?>&c_query_id=<?php echo urlencode($c_query_id)?>"><?php echo htmlspecialchars($tokens[0])?></a></td>
	<td bgcolor="#F5FAF7" style="font-size:12px; padding:5px;"><a href="geneDetail.php?geneSymbol1=<?php echo urlencode($tokens[1])?>&c_query_id=<?php echo urlencode($c_query_id)?>"><?php echo htmlspecialchars($tokens[1])?></a></td>
	<td bgcolor="#F5FAF7" style="font-size:12px; padding:5px;"><a href="genePair.php?geneSymbol1=<?php echo urlencode($tokens[0])?>&geneSymbol2=<?php echo urlencode($tokens[1])?>&c_query_id=<?php echo urlencode($c_query_id)?>"><?php echo $num_hits?> hits</a></td>
  </tr>
<?php 
    }
?>
</table>
<?php 
    } else {
?>
<p align="center" style="color:orange; font-size:14px; margin:20px 0;">
    <strong>No protein/gene interactions were found in the retrieved PubMed abstracts.</strong><br>
    <em>This may mean that the abstracts are too recent and haven't been processed by the Ignet engine yet, or no gene interactions were mentioned in these papers.</em>
</p>
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
