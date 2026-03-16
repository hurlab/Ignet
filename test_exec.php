<?php
echo "<h1>PHP Command Execution Test</h1>";

if (function_exists('exec')) {
    echo "<p style='color:green;'>exec() function is enabled.</p>";

    echo "<p>Attempting to run 'whoami' command...</p>";
    exec('whoami', $output, $return_code);

    echo "<p><b>Command Output:</b></p>";
    echo "<pre>";
    print_r($output);
    echo "</pre>";

    echo "<p><b>Return Code:</b> " . $return_code . " (0 means success)</p>";

} else {
    echo "<p style='color:red;'>exec() function is DISABLED in php.ini.</p>";
}
?>
