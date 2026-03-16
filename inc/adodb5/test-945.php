<?php
include 'adodb.inc.php';

//echo "pgsql: ";
//$db = ADONewConnection('pgsql');
//$db->connect('localhost', 'dregad', 'C0yote71');
//var_dump($db->execute(''));

echo "mysql: ";
$db = ADONewConnection('mysqli');
$db->connect('localhost', 'root', 'C0yote71', 'adodb');
$db->debug=true;
//var_dump($db->prepare(''));
var_dump($db->execute(''));

