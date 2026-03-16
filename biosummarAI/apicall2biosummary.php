<?php
// apicall2biosummary.php
// Use output buffering to catch any PHP warnings that fire before our code
// (e.g., "Unable to create temporary file" from PrivateTmp issues)
ob_start();

ini_set('display_errors', 0);
error_reporting(0);

// Discard any warning output that PHP emitted during POST parsing
ob_end_clean();

// Now start clean output
header("Content-Type: application/json");

// Get raw JSON input from request body
$input = file_get_contents("php://input");

// Handle empty input (can happen if PHP temp file creation fails for large POST bodies)
if ($input === false || $input === '') {
    echo json_encode(["status" => "error", "message" => "Empty request body. The request may be too large for server temp storage."]);
    exit;
}

// Decode the JSON into an associative array
$data = json_decode($input, true);

// Check if decoding failed
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON input: " . json_last_error_msg()]);
    exit;
}

// Prepare data to forward - include all potential keys
$forwardData = [
    'genes' => isset($data['genes']) ? $data['genes'] : null,
    'conversation_history' => isset($data['conversation_history']) ? $data['conversation_history'] : null,
    'prompt' => isset($data['prompt']) ? $data['prompt'] : null,
    'raw_sentences' => isset($data['raw_sentences']) ? $data['raw_sentences'] : null,
    'prompt_instructions' => isset($data['prompt_instructions']) ? $data['prompt_instructions'] : null
];

// Remove null keys before encoding
$forwardData = array_filter($forwardData, function($value) { return $value !== null; });

$jsonDataToSend = json_encode($forwardData);

// cURL initialization
$ch = curl_init();
$url = 'http://localhost:9636/biobert/'; // BioSummarAI Python backend endpoint

// cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonDataToSend)
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonDataToSend);
curl_setopt($ch, CURLOPT_TIMEOUT, 130); // Allow sufficient time for OpenAI

// Execute cURL request
$response_raw = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    echo json_encode(["status" => "error", "message" => 'cURL error: ' . curl_error($ch)]);
} else {
    // Check HTTP status code
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($httpcode >= 200 && $httpcode < 300) {
        // Attempt to decode the JSON response from Python
        $response_decoded = json_decode($response_raw, true);

        if (json_last_error() === JSON_ERROR_NONE && isset($response_decoded['Summary'])) {
            // Forward the 'Summary' part from the Python response
            echo json_encode(["status" => "success", "data" => $response_decoded['Summary']]);
        } else {
             echo json_encode([
                 "status" => "error",
                 "message" => "Invalid response received from backend service.",
                 "backend_response" => substr($response_raw, 0, 500)
             ]);
        }
    } else {
         echo json_encode([
            "status" => "error",
            "message" => "Backend service returned HTTP status code " . $httpcode,
            "backend_response" => substr($response_raw, 0, 500)
         ]);
    }
}

// Close cURL session
curl_close($ch);
?>
