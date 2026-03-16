<?php
/**
 * inc/get_image.php — streams the generated network PNG for the Gene tab.
 *
 * Looks in two places:
 *   1) ../tmp/ignet/<job_key>.png      (webroot storage)
 *   2) /tmp/ignet_<user>/<job_key>.png (fallback storage)
 *
 * Usage:
 *   /ignet/inc/get_image.php?job_key=A1BG
 */

ini_set('display_errors', 0);
error_reporting(0);

// ---- Helpers ----
function sanitize_job_key($s) {
    // Mirror the same sanitization used in do_layout.php
    $s = (string)$s;
    $s = preg_replace('/\W+/', '_', $s);
    // prevent empty
    return $s !== '' ? $s : null;
}

function candidate_paths($job) {
    // Candidate #1: webroot tmp/ignet
    $webroot_tmp = realpath(__DIR__ . '/../tmp');
    if ($webroot_tmp === false) {
        $webroot_tmp = __DIR__ . '/../tmp'; // may not exist yet; still try
    }
    $cand1 = $webroot_tmp . '/ignet/' . $job . '.png';

    // Candidate #2: system temp fallback used by do_layout.php
    $altBase = rtrim(sys_get_temp_dir(), '/');
    $userTag = function_exists('get_current_user') ? get_current_user() : 'web';
    $cand2 = $altBase . '/ignet_' . $userTag . '/' . $job . '.png';

    return [$cand1, $cand2];
}

function send_not_found($msg = 'Image not found') {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo $msg;
    exit;
}

// ---- Read and validate input ----
$job = isset($_GET['job_key']) ? sanitize_job_key($_GET['job_key']) : null;
if (!$job) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Missing or invalid job_key";
    exit;
}

// ---- Resolve existing file ----
list($cand1, $cand2) = candidate_paths($job);
$png = null;
if (is_file($cand1)) {
    $png = $cand1;
} elseif (is_file($cand2)) {
    $png = $cand2;
}
if (!$png) {
    send_not_found("Image not found for job_key '{$job}'");
}

// ---- Stream the PNG (with light caching headers) ----
$mtime = @filemtime($png);
$size  = @filesize($png);

header('Content-Type: image/png');
if ($size !== false) header('Content-Length: ' . $size);
if ($mtime !== false) {
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
    header('Cache-Control: public, max-age=3600'); // 1 hour
}

// Optional: support If-Modified-Since for basic client caching
if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) && $mtime !== false) {
    $ifMod = strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']);
    if ($ifMod !== false && $ifMod >= $mtime) {
        http_response_code(304);
        exit;
    }
}

// Output the file
$fp = @fopen($png, 'rb');
if (!$fp) {
    send_not_found("Unable to read image");
}
fpassthru($fp);
fclose($fp);
exit;
