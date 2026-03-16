<?php 
include('../../inc/functions.php');
$db = ADONewConnection('mysqli');
$db->Connect($host, $username, $password, $database);

$db->Execute("TRUNCATE TABLE sentence_gene");
$db->Execute("LOAD DATA LOCAL INFILE '/data/var/projects/ignet/sid-genes_db_v4.txt' INTO TABLE sentence_gene COLUMNS TERMINATED BY '	'");

?>
