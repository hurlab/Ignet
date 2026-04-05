<?php
// searchgenes.php
ini_set('display_startup_errors', 0);
ini_set('display_errors', 0);
error_reporting(0);
set_time_limit(300); // 5 minutes max execution time
ini_set('memory_limit', '512M'); // Increase memory limit

include_once(__DIR__ . '/../inc/functions.php');

// --- Start Database Connection ---
$db = null;
if (!isset($driver) || !isset($host) || !isset($username) || !isset($password) || !isset($database)) {
    die("Error: Database configuration variables are not defined in functions.php.");
}
try {
    if (!function_exists('ADONewConnection')) throw new Exception("ADOdb library not loaded.");
    $db = ADONewConnection($driver);
    $db->Connect($host, $username, $password, $database);
    $db->SetFetchMode(ADODB_FETCH_ASSOC);
    if (!$db->IsConnected()) throw new Exception("DB Connection Failed: " . $db->ErrorMsg());
} catch (Exception $e) {
    die("Database Connection Error: " . htmlspecialchars($e->getMessage()));
}

// --- Get Input ---
// Handle both array input (from dropdown) and text input
$genes_raw_input = '';
if (isset($_POST["genes"]) && is_array($_POST["genes"])) {
    $genes_raw_input = $_POST["genes"];
} elseif (isset($_POST["genes"]) && is_string($_POST["genes"])) {
    $genes_raw_input = $_POST["genes"];
} elseif (isset($_POST["genes_raw_text"]) && !empty($_POST["genes_raw_text"])) {
    $genes_raw_input = $_POST["genes_raw_text"];
}

// Default to 'union' if not specified
$search_type = isset($_POST['search_type']) ? $_POST['search_type'] : 'union';

// Process gene input into a clean array
$genes_array_input = [];
if (is_array($genes_raw_input)) {
    $genes_array_input = $genes_raw_input;
} elseif (is_string($genes_raw_input) && trim($genes_raw_input) !== '') {
    $genes_array_input = preg_split('/[\s,;]+/', $genes_raw_input, -1, PREG_SPLIT_NO_EMPTY);
}
$genes_array_input = array_filter(array_unique(array_map('trim', $genes_array_input)));

$processed_results = [];
$error_message = '';
$executionTime = 0;
$result_limit_reached = false;

// IMPORTANT: Set maximum result limit to prevent memory issues
define('MAX_PMID_LIMIT', 5000);  // Limit PMIDs fetched
define('MAX_RESULT_LIMIT', 500);  // Limit final results displayed

if (!empty($genes_array_input)) {
    $sanitized_genes_sql = [];
    foreach ($genes_array_input as $gene) {
        if (is_string($gene) && preg_match('/^[a-zA-Z0-9_.\-]+$/', $gene)) {
            $sanitized_genes_sql[] = $db->qstr($gene);
        }
    }

    if (!empty($sanitized_genes_sql)) {
        $genesListSQL_IN = implode(",", $sanitized_genes_sql);
        $startTime = microtime(true);

        // --- Step 1: Get PMIDs for ANY of the genes (Union base) ---
        $pmids = [];
        try {
            $sql_pmids = "SELECT DISTINCT t.PMID
                          FROM t_sentence_hit_gene2gene_Host AS t
                          WHERE t.geneSymbol1 IN ($genesListSQL_IN) OR t.geneSymbol2 IN ($genesListSQL_IN)";
            
            // Apply LIMIT to prevent memory overflow
            $rs_pmids = $db->SelectLimit($sql_pmids, MAX_PMID_LIMIT);

            if ($rs_pmids) {
                while (!$rs_pmids->EOF) {
                    if (isset($rs_pmids->fields['PMID']) && $rs_pmids->fields['PMID'] !== null) {
                       $pmids[] = (int)$rs_pmids->fields['PMID'];
                    }
                    $rs_pmids->MoveNext();
                }
                $rs_pmids->Close();
                $pmids = array_unique($pmids);
                
                // Check if we hit the PMID limit
                if (count($pmids) >= MAX_PMID_LIMIT) {
                    $result_limit_reached = true;
                }
            } else {
                 throw new Exception("PMID Query Failed: " . $db->ErrorMsg());
            }
        } catch (Exception $e) {
             $error_message .= "<p>Error querying PMIDs: " . htmlspecialchars($e->getMessage()) . "</p>";
        }

        // --- Step 2: Fetch details for these PMIDs ---
        $initial_results = [];
        if (!empty($pmids)) {
            // Limit the number of PMIDs to query for details
            $pmids_limited = array_slice($pmids, 0, MAX_PMID_LIMIT);
            $pmidlistSQL_IN = implode(',', $pmids_limited);
            
            try {
                $sql_details = "SELECT pmid, sentences, drug_term, hdo_term, gene_symbols
                                FROM t_biosummary
                                WHERE pmid IN ($pmidlistSQL_IN)";
                $rs_details = $db->Execute($sql_details);

                if ($rs_details) {
                    $initial_results = $rs_details->GetAll();
                    $rs_details->Close();
                } else {
                    throw new Exception("Details Query Failed: " . $db->ErrorMsg());
                }
            } catch (Exception $e) {
                 $error_message .= "<p>Error fetching details: " . htmlspecialchars($e->getMessage()) . "</p>";
            }
        } else {
             if (empty($error_message)) {
                 $error_message .= "<p>No PubMed articles found mentioning any of the specified genes.</p>";
             }
        }

        // --- Step 3: Filter & Process based on Search Type ---
        $final_results = [];
        $required_genes_lower = array_map('strtolower', $genes_array_input);

        if (!empty($initial_results)) {
            foreach ($initial_results as $row) {
                // Parse genes present in this record
                $present_genes = array_filter(array_map('trim', preg_split('/[,\s]+/', $row['gene_symbols'] ?? '')));
                $present_genes_lower = array_map('strtolower', $present_genes);
                $present_genes_unique_lower = array_unique($present_genes_lower);
                
                // Count how many of the SEARCHED genes are in this record
                $common_genes = array_intersect($required_genes_lower, $present_genes_unique_lower);
                $row['searched_gene_count'] = count($common_genes);

                if ($search_type === 'intersection' && count($genes_array_input) > 1) {
                    // Intersection: Record must contain ALL searched genes
                    if (count($common_genes) === count($required_genes_lower)) {
                        $final_results[] = $row;
                    }
                } else {
                    // Union (or single gene): Record must contain AT LEAST ONE searched gene
                    if (count($common_genes) > 0) {
                        $final_results[] = $row;
                    }
                }
                
                // Stop if we've reached the result limit
                if (count($final_results) >= MAX_RESULT_LIMIT) {
                    $result_limit_reached = true;
                    break;
                }
            }
            
            if (empty($final_results) && empty($error_message)) {
                 if ($search_type === 'intersection') {
                     $error_message .= "<p>No records found containing <b>ALL</b> of the specified genes together.</p>";
                 } else {
                     $error_message .= "<p>No records found containing <b>ANY</b> of the specified genes.</p>";
                 }
            }
        }

        // --- Step 4: Sort by Searched Gene Count (Descending) ---
        if (!empty($final_results)) {
            usort($final_results, function ($a, $b) {
                return $b['searched_gene_count'] <=> $a['searched_gene_count'];
            });
        }

        $processed_results = $final_results;
        $executionTime = microtime(true) - $startTime;

    } else {
         $error_message .= "<p>No valid gene symbols were provided.</p>";
    }
} else {
    $error_message .= "<p>No genes were submitted.</p>";
}

// Pass variables to list.php
$_POST['processed_results'] = $processed_results;
$_POST['genes_raw'] = $genes_raw_input;
$_POST['genes_array_input'] = $genes_array_input;
$_POST['error_message'] = $error_message;
$_POST['execution_time'] = $executionTime;
$_POST['final_search_type'] = $search_type;
$_POST['result_limit_reached'] = $result_limit_reached;

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Ignet - BioSummarAI Results</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="shortcut icon" href="/favicon.ico"/>
    <link href="../css/bmain.css" rel="stylesheet" type="text/css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
</head>
<body style="margin:0px; background-image:url(../images/bg_2008-08-21.2.gif)" id="main_body">
<?php include(__DIR__ . '/../inc/template_top.php'); ?>
<table width="100%" border="0" cellpadding="0" cellspacing="0">
    <tr>
        <td width="160" valign="top" style="min-width:160px">
            <?php include(__DIR__ . '/../inc/template_left.php'); ?>
        </td>
        <td valign="top">
            <div style="margin:6px 10px 16px 10px; border-top:2px #4A2F65 solid">
                <h3 align="center">BioSummarAI Search Results</h3>
                <?php include('list.php'); ?>
                <p>&nbsp;</p>
            </div>
        </td>
    </tr>
</table>
<?php if (isset($db) && $db && $db->IsConnected()) $db->Close(); ?>
</body>
</html>
