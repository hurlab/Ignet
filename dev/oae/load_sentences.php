<?php
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$db->Execute("TRUNCATE TABLE sentence_oae");

for($i=1; $i<=30; $i++) {
$db->Execute("LOAD DATA LOCAL INFILE '/data/home/juhur/SciMiner_Complete_Data_2011Dec/RawData/SciMinerOAEOutput/NCIBISentencesSet_".$i.".txt_FINAL_OUTPUT_OAESciMiner.txt' INTO TABLE sentence_oae COLUMNS TERMINATED BY '	' ignore 4 lines");
}
?>