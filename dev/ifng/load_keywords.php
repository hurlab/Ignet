<?php 
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$lines=file('/data/var/projects/ignet/ifng-table-intwords-v1.txt');

$i=714491;
foreach ($lines as $line) {
	$db->Execute("UPDATE ignet set keywords='". trim($line) . "' where c_hit_id=".$i);
	
	$i++;
}

?>
Done!