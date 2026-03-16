<?php 

include('../inc/functions.php');

error_reporting(0);
ini_set('display_errors', '0');

// Database connection using ADODB
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

echo "Database connection successful.\n";

// Directory where .sentence files are stored
$directory = "/tmp/Sentence/";
$files = glob($directory . "*.sentence");  // Get all .sentence files

$totalRowsAdded = 0;  // Track total rows added across all files

foreach ($files as $file) {
    echo "Processing file: $file\n";

    // Open the file for reading
    $handle = fopen($file, "r");
    $rowsAdded = 0;  // Track rows added for the current file

    if ($handle) {
        while (($line = fgets($handle)) !== false) {
            $columns = explode("\t", trim($line));

            // Debugging: Print raw line and processed columns
            echo "Raw Line: $line\n";
            print_r($columns);

            // Ensure valid data (at least two columns: sentenceID and PMID)
            if (count($columns) < 2) {
                echo "Skipping invalid line: " . print_r($columns, true) . "\n";
                continue;
            }

            // Extract relevant columns
            $sentenceID = intval($columns[0]);  // Unique ID
            $PMID = intval($columns[1]);  // PubMed ID
            $sentence = isset($columns[7]) && !empty(trim($columns[7])) ? $db->qstr(trim($columns[7])) : "NULL";  // Handle empty values

            // Get additional sentence data if needed
            $sentenceData = getSentenceData($sentenceID, $db);
            echo "Fetched Sentence Data: $sentenceData\n";

            // SQL Insert Query with ON DUPLICATE KEY UPDATE
            $strSql = "INSERT INTO sentences25_Host (sentenceID, PMID, sentence) 
                       VALUES ($sentenceID, $PMID, $sentence)
                       ON DUPLICATE KEY UPDATE sentence = VALUES(sentence);";

            // Debugging: Print the SQL statement being executed
            echo "Executing SQL: $strSql\n";

            // Execute the query
            if ($db->Execute($strSql)) {
                $rowsAdded++;
                $totalRowsAdded++;
                echo "Row added successfully.\n";
            } else {
                echo "Error inserting data: " . $db->ErrorMsg() . "\n";
            }
        }
        fclose($handle);
        echo "Added $rowsAdded rows from $file\n";
    } else {
        echo "Failed to open file: $file\n";
    }
}

echo "\nData import complete! A total of $totalRowsAdded rows were added to sentences25_Host.\n";
?>

