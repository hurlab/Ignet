<?php 
include('../inc/functions.php');
?>

<?php
error_reporting(0);
ini_set('display_errors', 0);

$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);
try{
$vali=new Validation($_REQUEST);
$geneSymbol1 = $vali->getInput('geneSymbol1', 'Gene Name 1', 0, 50, true);
$geneSymbol2 = $vali->getInput('geneSymbol2', 'Gene Name 2', 0, 50, true);
$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);
}
catch (Exception $e) { echo "Error: " . $e->getMessage(); }

//$strSql = "SELECT 
  //  t.gene2gene_host_id AS c_hit_id,
   // t.PMID,
   // t.geneMatch1,
    //t.geneMatch2,
    //t.geneSymbol1,
    //t.geneSymbol2,
    //sv.sentence
//FROM 
  //  t_sentence_hit_gene2gene_Host AS t
//LEFT JOIN 
  //  sentences24_Host AS sv 
//ON 
  //  t.PMID = sv.PMID
//WHERE 
  //  ( 
    //    (t.geneSymbol1 = '$geneSymbol1' AND t.geneSymbol2 = '$geneSymbol2') 
      //  OR 
       // (t.geneSymbol2 = '$geneSymbol1' AND t.geneSymbol1 = '$geneSymbol2')
//)";
//
//Start time 
$startTime = microtime(true);

function getSentenceData($sentence_ID, $db){
	$strSql2 = "Select * from sentences24_Host where sentenceID =" . (int)$sentence_ID;
	$rs2 = $db->Execute($strSql2);

        if (!$rs2->EOF)
        {
                $sentences = $rs2->GetArray();
                //print_r($sentences);
                $sentence = $sentences[0]['sentence'];
                $sentenceID = $sentences[0]['sentenceID'];
                //echo $sentenceID;
		$rs2->close();
		return $sentence;
        }

}
function getConfidenceScore($data){
//cURL initialization
$ch = curl_init();
$url = 'http://localhost:9635/biobert/';
// cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

// Execute cURL request
$response = curl_exec($ch);

// Check for errors
        if (curl_errno($ch)) {
                throw new Exception('cURL error: ' . curl_error($ch), 500);
        } else {
                //echo 'Response: ' . $response[0];
                echo "<br><br><br>";
                $response = json_decode($response);
                // Close cURL session
                curl_close($ch);
                return $response[0]->ConfidenceScore;
        }
}

function updateConfidenceScore($confidenceScore, $gene2gene_host_id, $db){
$strSql3 = "UPDATE t_sentence_hit_gene2gene_Host SET score = " . (float)$confidenceScore . " WHERE gene2gene_host_id = " . (int)$gene2gene_host_id;
         echo "host_id:".$gene2gene_host_id;       
       //echo $strSql3;
                 
        echo "<br>";
        $rs3 = $db->Execute($strSql3);
        //echo $rs3;
        if ($rs3)
        {        
                echo "------------UPDATE SUCCESSFUL-------------"."<br><br>";
        }
        else {  
                echo "query unsuccessful. Error: " . $db->ErrorMsg();

                }
        
}               
 

try{
//$strSql = "SELECT gene2gene_host_id AS c_hit_id,PMID, geneMatch1, geneMatch2, geneSymbol1, geneSymbol2, sentenceID FROM t_sentence_hit_gene2gene_Host WHERE score is NULL LIMIT 10000";
//$strSql .= "  ((geneSymbol1 = '$geneSymbol1' AND geneSymbol2 = '$geneSymbol2') OR (geneSymbol2 = '$geneSymbol1' AND geneSymbol1 = '$geneSymbol2') AND score = NULL ) LIMIT 5";
$strSql = "SELECT 
    t.gene2gene_host_id AS c_hit_id, 
    t.PMID, 
    t.geneMatch1, 
    t.geneMatch2, 
    t.geneSymbol1, 
    t.geneSymbol2, 
    t.sentenceID, 
    sv.sentence 
FROM 
    t_sentence_hit_gene2gene_Host AS t 
LEFT JOIN 
    sentences24_Host AS sv 
ON 
    t.sentenceID = sv.sentenceID 
WHERE 
    t.score IS NULL 
LIMIT 1000";
//echo $strSql;

$payload = [];

$rs = $db->Execute($strSql);
if (!$rs->EOF)
{
	$array_c_hit_ids = $rs->GetArray();
	//print_r($array_c_hit_ids);
	$firstrow = $array_c_hit_ids[0];
	//print_r($firstrow);
	//die();
	echo "<br><br>";
	$rs->close();
	//$strSql2 = "Select * from sentences24_Host where sentenceID =".$firstrow["sentenceID"];
        //$rs2 = $db->Execute($strSql2);
	//if (!$rs2->EOF)	
	//{
	//	$sentences = $rs2->GetArray();
		//print_r($sentences);
	//	$sentence = $sentences[0]['sentence'];
	//	$sentenceID = $sentences[0]['sentenceID'];
		//echo $sentenceID;
	//	$rs2->close();
	//}
	$numOfRecords = sizeof($array_c_hit_ids);
	//echo $numOfRecords;
	$updateQueries = [];
	foreach ($array_c_hit_ids as $row) {
		$gene2gene_host_id = $row["c_hit_id"];
		//print_r($row);
		//die();
		//echo $row["sentenceID"]."<br><br>";
		//$sentence = getSentenceData($row["sentenceID"], $db);
		//echo "sentence:".$sentence."<br>";
		$data = json_encode([["Sentence" => $row["sentence"], "ID" => "ID1", "MatchTerm" => $row["geneSymbol1"]],["Sentence" => $row["sentence"], "ID" => "ID2", "MatchTerm" => $row["geneSymbol2"]]]);
		//function call
        	$confidenceScore = getConfidenceScore($data);
        	echo $confidenceScore."<br><br>";
		if (isset($confidenceScore)) {

                	//updateConfidenceScore($confidenceScore, $gene2gene_host_id, $db);
			$updateQueries[]  = "UPDATE t_sentence_hit_gene2gene_Host SET score = " . (float)$confidenceScore . " WHERE gene2gene_host_id = " . (int)$gene2gene_host_id;
         		echo "host_id:".$gene2gene_host_id;
                }
        	else { echo "Confidence Score not found."; }
		//echo "c_hit_id: ".$row['c_hit_id'].", geneSymbol1: ".$row['geneSymbol1']."geneSymbol2: ".$row['geneSymbol2']."geneMatch1: ".$row['geneMatch1']."geneMatch2: ".$row['geneMatch2']."<br>"; }
	}
	//$strSql3 = "UPDATE t_sentence_hit_gene2gene_Host SET score = " . (float)$confidenceScore . " WHERE gene2gene_host_id = " . (int)$gene2gene_host_id;
        // echo "host_id:".$gene2gene_host_id;
       //echo $strSql3;

	echo "<br>";
	$finalUpdateQuery = implode(";", $updateQueries);
	print_r($finalUpdateQuery);
	die();
        $rs3 = $db->Execute($strSql3);
        //echo $rs3;
        if ($rs3)
        {
                echo "------------UPDATE SUCCESSFUL-------------"."<br><br>";
        }
        else {
                echo "query unsuccessful. Error: " . $db->ErrorMsg();

                }
		//$sentence = getSentenceData($firstrow["sentenceID"], $db);
	//die();
}
else{
echo "query unsuccessful. Error: " . $db->ErrorMsg();
}
// API URL
//$url = 'http://localhost:9635/biobert/';

// Data to send in the POST request
//$data = json_encode([["Sentence" => "Sentence1 MatchTerm1 transduction MatchTerm2 MatchTerm3 and MatchTerm4.", "ID" => "ID1", "MatchTerm" => "MatchTerm1"],
  //  ["Sentence" => "Sentence1 MatchTerm1 transduction MatchTerm2 MatchTerm3 and MatchTerm4.", "ID" => "ID2", "MatchTerm" => "MatchTerm2"]
//]);

// End time 
$endTime = microtime(true); 
// Calculate execution time 
$executionTime = $endTime - $startTime; echo "Execution time: " . $executionTime . " seconds.";
}
catch (Exception $e) { echo "General Exception: " . $e->getMessage() . "<br>"; }

?>
