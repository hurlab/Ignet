<?php 
//get sentence from ncibi db

header("Content-Type: text/plain");
ini_set("memory_limit", "8192M");
set_time_limit(60*60);

include_once('../../inc/functions.php');


$db_ms = ADONewConnection('odbc_mssql');
$db_ms->Connect('NCIBIDBX', 'zxiang', 'x3dc1FS', 'pubmed_11n');

$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);


$strSql="SELECT sentence_id FROM sentence_gene";
$rs=$db->Execute($strSql);

foreach($rs as $row) {
	$a_sids[trim($row['sentence_id'])]=1;
}


$a_a_sids= array_chunk(array_keys($a_sids), 1000);
$i=0;
foreach ($a_a_sids as $a_tmp_sids) {
	$i+=1000;
	print("...$i\n");
	
	$strSql="SELECT sentenceID, [Document].PMID, sentence 
FROM Sentence INNER JOIN
Paragraph ON Sentence.paragraphID = Paragraph.paragraphID INNER JOIN
Section ON Paragraph.sectionID = Section.sectionID INNER JOIN
[Document] ON Section.documentID = [Document].documentID
WHERE sentenceID IN (".join(', ', $a_tmp_sids).")";


//	$strSql="SELECT  sentenceID, sentence  FROM Sentence WHERE sentenceID IN (".join(', ', $a_tmp_sids).")";
//	print($strSql."\n");
	$rs=$db_ms->Execute($strSql);
	$strValues='';
		
	foreach($rs as $row) {
		if ($strValues!='') $strValues.=', ';
		$strValues.="(".$row[0].", ".$db->qstr($row[1]).", ".$db->qstr($row[2]).")";
	}
	
	$strSql="INSERT IGNORE INTO sentence (sentenceid, pmid, sentence) VALUES ". $strValues;
	$db->Execute($strSql);
		
}
?>
Done!