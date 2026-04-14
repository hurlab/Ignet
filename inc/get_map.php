<?php 
include('functions.php');
$vali=new Validation($_REQUEST);
$c_job_key = $vali->getInput('c_job_key', 'Image Key', 1, 128, true);

$c_job_key = preg_replace('/\W+/', '_', $c_job_key);
if (file_exists("../tmp/ignet/$c_job_key.map")) {
	include("../tmp/ignet/$c_job_key.map");		
}
?>
