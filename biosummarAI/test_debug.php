<?php
// STEP 1: Test if PHP works at all
echo "PHP IS WORKING<br>";

// STEP 2: Test error display
ini_set('display_startup_errors', 0);
ini_set('display_errors', 0);
error_reporting(0);
echo "Error reporting enabled<br>";

// STEP 3: Test functions.php include
echo "About to include functions.php...<br>";
if (file_exists('../inc/functions.php')) {
    echo "functions.php file exists<br>";
    include('../inc/functions.php');
    echo "functions.php included successfully<br>";
} else {
    die("ERROR: functions.php not found at ../inc/functions.php");
}

// STEP 4: Test database variables
echo "Checking database variables...<br>";
if (isset($driver)) echo "driver = $driver<br>";
if (isset($host)) echo "host = $host<br>";
if (isset($database)) echo "database = $database<br>";

// STEP 5: Test ADOdb
if (function_exists('ADONewConnection')) {
    echo "ADONewConnection function exists<br>";
} else {
    die("ERROR: ADONewConnection not found - ADOdb not loaded");
}

// STEP 6: Try database connection
echo "Attempting database connection...<br>";
try {
    $db = ADONewConnection($driver);
    echo "ADONewConnection created<br>";
    
    $conn = $db->Connect($host, $username, $password, $database);
    echo "Connect called, result: " . ($conn ? 'SUCCESS' : 'FAILED') . "<br>";
    
    if($conn) {
        echo "Database connected successfully!<br>";
        
        // Try to fetch genes
        echo "Fetching genes...<br>";
        $strSql = "SELECT DISTINCT gene_symbol FROM t_gene_list WHERE gene_symbol IS NOT NULL AND gene_symbol != '' ORDER BY gene_symbol ASC LIMIT 5";
        $rs = $db->Execute($strSql);
        
        if($rs) {
            echo "Query executed successfully!<br>";
            $count = 0;
            foreach($rs as $row) {
                echo "Gene: " . $row['gene_symbol'] . "<br>";
                $count++;
            }
            echo "Fetched $count genes<br>";
            $rs->close();
        } else {
            echo "Query failed: " . $db->ErrorMsg() . "<br>";
        }
    }
} catch(Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "If you see this, the problem is after this point in the original code.";
?>
