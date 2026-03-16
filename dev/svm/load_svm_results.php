<?php 
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);


/*
$work_dir="/data/var/projects/ignet/data";
$db->Execute("TRUNCATE TABLE t_sentence_hit_gene2gene");

foreach (glob("$work_dir/*.db.data") as $filename) {
	$db->Execute("LOAD DATA LOCAL INFILE '$filename' INTO TABLE t_sentence_hit_gene2gene");
	
	print("LOAD DATA INFILE '$filename' INTO TABLE t_sentence_hit_gene2gene;\n");
}
*/


$work_dir="/data/var/projects/ignet/data";
$db->Execute("TRUNCATE TABLE t_sentence_hit_gene2vaccine");

foreach (glob("$work_dir/*.db.data") as $filename) {
	$db->Execute("LOAD DATA LOCAL INFILE '$filename' INTO TABLE t_sentence_hit_gene2vaccine");
	
	print("LOAD DATA INFILE '$filename' INTO TABLE t_sentence_hit_gene2vaccine;\n");
}
?>
Done!
