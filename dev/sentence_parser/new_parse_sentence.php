<?php 
//this script use stanford parser to parse sentences.

echo "hi\n";

include_once('../../inc/functions.php');

//$db = ADONewConnection($driver);
//$db->Connect($host, $username, $password, $database);

echo "hi 2\n";

$inputs = glob("/extDataS/hurlabsharedds1/SciminerOutput/sentence_filtered/SentenceFiltered/*");
echo $inputs;


$threadid=$argv[1];

$strSql="SELECT * FROM sentence where tag_time is null";
$strSql .= " and sentenceid like '%{$threadid}'";
$strSql .= " limit 50";
$rs=$db->Execute($strSql);

while (!$rs->EOF) {
	$a_sentence=array();
	$a_sid=array();
	foreach($rs as $row) {
		$tokens=preg_split('/\W+/', $row['sentence']);
		if (sizeof($tokens)<150) {
			$a_sentence[]=preg_replace('/[\r\n]+/', ' ', $row['sentence']);
			$a_sid[]=$row['sentenceid'];
		}
		else {
			$strSql="UPDATE sentence SET tag_time=now() WHERE sentenceid =". $row['sentenceid'];
			$db->Execute($strSql);
		}
	}
	
	file_put_contents('/data/var/projects/ignet/stanford_nlp/stanford-parser-2011-12-18/file'.$threadid. '.txt', join("\n", $a_sentence));
	
	chdir('/data/var/projects/ignet/stanford_nlp/stanford-parser-2011-12-18/');
	$str_output = shell_exec('java -Xmx2048m edu.stanford.nlp.parser.lexparser.LexicalizedParser -sentences newline -retainTmpSubcategories -outputFormat "typedDependencies" -outputFormatOptions "CCPropagatedDependencies" grammar/englishPCFG.ser.gz file'.$threadid.'.txt 2>&1');
	
	$a_output=preg_split('/[\r\n]+/', $str_output);
	//print_r($a_output);
	$a_parse=array();
	
	$i=0;
	foreach($a_output as $line) {
		if (preg_match('/^(.+)\((.+)-(\d+), (.+)-(\d+)\)$/', $line, $match)) {
			$strSql="INSERT INTO typed_dependency_parse (sentenceid, governor, governor_token, relation, dependent, dependen_token) VALUES (".$a_sid[$i].", ".$db->qstr($match[2]).", ".$db->qstr($match[3]).", ".$db->qstr($match[1]).", ".$db->qstr($match[4]).", ".$db->qstr($match[5]).")";
			$db->Execute($strSql);
			print($line."\n");
			//print($strSql."\n");
		}
		elseif(preg_match('/Parsing \[sent\. (\d+) len/', $line, $match)) {
			$i=$match[1]-1;	
		}
		else {
			print("***".$line."\n");
		}
	}
	
	if (sizeof($a_sid)>0) {
		$strSql="UPDATE sentence SET tag_time=now() WHERE sentenceid in (".join(', ', $a_sid).")";
		$db->Execute($strSql);
	}

	$strSql="SELECT * FROM sentence where tag_time is null";
	$strSql .= " and sentenceid like '%{$threadid}'";
	$strSql .= " limit 50";
	$rs=$db->Execute($strSql);
}
?>
Done!
