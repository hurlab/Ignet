<?php 
include('functions.php');
$vali=new Validation($_REQUEST);
$c_job_key = $vali->getInput('c_job_key', 'Image Key', 1, 128, true);

$c_job_key = preg_replace('/\W+/', '_', $c_job_key);
header('Pragma: anytextexeptno-cache', true);
header('Content-type: image/png');
header('Content-Transfer-Encoding: Binary');
if (file_exists("../tmp/ignet/$c_job_key.png")) {
	header('Content-length: '.filesize("../tmp/ignet/$c_job_key.png"));
	readfile("..//tmp/ignet/$c_job_key.png");
}
else {
	header('Content-length: '.filesize("../images/pixel.gif"));
	readfile("../images/pixel.gif");
}
?>
