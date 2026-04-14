<?php
// summary_page.php
ini_set('display_startup_errors', 0);
ini_set('display_errors', 0);
error_reporting(0);

// Include Parsedown library - adjust path if necessary
require __DIR__ . '/parsedown-master/Parsedown.php';
// Include functions if needed (e.g., for header/footer templates)
// include_once(__DIR__ . '/../inc/functions.php');

$summary_html = "<p>Loading summary...</p>";
$chat_context = "[]"; // Default empty JSON array for conversation history
$genes_searched = isset($_POST['genes_searched']) ? htmlspecialchars($_POST['genes_searched']) : 'Unknown';

if (isset($_POST['sentences_json'])) {
    $sentences_json = $_POST['sentences_json'];
    $sentences_array = json_decode($sentences_json, true);

    if (is_array($sentences_array) && !empty($sentences_array)) {
        // Prepare data for the Python backend API call
        // Combine sentences into a single string for the prompt, or send as array if backend handles it
        $combined_sentences_text = implode("\n", $sentences_array);

        $postData = json_encode([
            "raw_sentences" => $combined_sentences_text, // Use a specific key for raw sentences
             "genes" => null, // Not needed for this type of summary
             "conversation_history" => null, // Start fresh
             "prompt" => null // Not needed for initial summary
        ]);

        // Use cURL to call your Python API endpoint
        $ch_summary = curl_init();
        $url_summary = 'http://localhost:9636/biobert/'; // BioSummarAI Python endpoint

        curl_setopt($ch_summary, CURLOPT_URL, $url_summary);
        curl_setopt($ch_summary, CURLOPT_POST, true);
        curl_setopt($ch_summary, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch_summary, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch_summary, CURLOPT_POSTFIELDS, $postData);
        // Set a reasonable timeout
        curl_setopt($ch_summary, CURLOPT_TIMEOUT, 120); // 120 seconds timeout for API call

        $summary_response_raw = curl_exec($ch_summary);
        $summary_response = null;

        if (!curl_errno($ch_summary)) {
            $summary_response = json_decode($summary_response_raw, true);
            // Check structure based on api_biosummary.py's return format
            if (isset($summary_response['Summary']['reply']) && isset($summary_response['Summary']['conversation_history'])) {
                 $parsedown = new Parsedown();
                 $summary_markdown = $summary_response['Summary']['reply'];
                 // Remove the initial "**BioSummarAI:** " if present
                 $summary_markdown = preg_replace('/^\*\*BioSummarAI:\*\*\s*/', '', $summary_markdown);
                 $summary_html = $parsedown->text($summary_markdown);
                 // Store the initial conversation history (request + response) for the chat page
                 $chat_context = json_encode($summary_response['Summary']['conversation_history']);
            } else {
                 $summary_html = "<p>Error: Unexpected response format from summary API.</p><pre>" . htmlspecialchars($summary_response_raw) . "</pre>";
            }
        } else {
             $summary_html = "<p>Error contacting summary service: " . htmlspecialchars(curl_error($ch_summary)) . "</p>";
        }
        curl_close($ch_summary);

    } else {
        $summary_html = "<p>Error: No valid sentences received to summarize.</p>";
    }
} else {
    $summary_html = "<p>Error: No sentences data received.</p>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BioSummarAI - Summary</title>
    <link href="../css/bmain.css" rel="stylesheet" type="text/css" />
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        #summaryContainer {
            border: 1px solid #ccc;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
            max-height: 500px;
            overflow-y: auto;
            line-height: 1.6;
        }
        #summaryContainer h3 { margin-top: 0; }
        .send-btn { /* Style from list.php */
            background: #000; border: 1px solid black; color: white;
            font-size: 16px; margin: 8px 0; padding: 8px 15px;
            border-radius: 4px; cursor: pointer; transition: .4s all;
        }
        .send-btn:hover { background: white; color: black; border: 1px solid black; }
        /* Add styles from Ignet summary V1.html if desired */
        #summaryContainer p { margin-bottom: 0.5em; }
        #summaryContainer ul, #summaryContainer ol { margin-top: 0.5em; margin-bottom: 0.5em; }
        #summaryContainer li { margin-bottom: 0.25em; }
        #summaryContainer strong, #summaryContainer b { font-weight: bold; }
        #summaryContainer h1, #summaryContainer h2, #summaryContainer h3, #summaryContainer h4 { margin-bottom: 0.5em; margin-top: 1em; }

    </style>
</head>
<body>

<?php // include('../inc/template_top.php'); // Optional: Include header template ?>

<h2>BioSummarAI Summary</h2>
<p>Summary based on search for gene(s): <?php echo $genes_searched; ?></p>

<div id="summaryContainer">
    <h3>AI Generated Summary:</h3>
    <?php echo $summary_html; // Output the generated summary HTML ?>
</div>

<form id="chatForm" action="chat_page.php" method="POST" target="_blank">
    <input type="hidden" name="chat_context" value="<?php echo htmlspecialchars($chat_context, ENT_QUOTES, 'UTF-8'); ?>">
    <input type="hidden" name="genes_searched" value="<?php echo htmlspecialchars($genes_searched, ENT_QUOTES, 'UTF-8'); ?>">
    <button type="submit" class="send-btn">Chat about this Summary</button>
</form>

<?php // include('../inc/template_footer.php'); // Optional: Include footer template ?>

</body>
</html>
