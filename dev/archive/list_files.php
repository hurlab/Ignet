<?php 
$work_dir="/data/var/projects/ignet/data";

$a_hits=array();
foreach (glob("$work_dir/*.db.data") as $filename) {
	$lines = file($filename);
	preg_match('/\/(\d+)\./', $filename, $match);
	$a_hits[$match[1]]=sizeof($lines);
}

ksort($a_hits);
print_r($a_hits);
?>
Done!