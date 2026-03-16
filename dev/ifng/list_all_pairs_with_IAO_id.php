<?php 
include_once('../../inc/functions.php');

//Use curl to do a post request
function my_curl_post_contents($url, $fields) {
	//open connection
	$ch = curl_init();
	$fields_string = http_build_query($fields);
	
	//set the url, number of POST vars, POST data
	curl_setopt($ch,CURLOPT_URL,$url);
	curl_setopt($ch,CURLOPT_POST,count($fields));
	curl_setopt($ch,CURLOPT_POSTFIELDS,$fields_string);
	curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
	
	//execute post
	$result = curl_exec($ch);
	
	if ($result===false) {
		error_log("curl error: " . curl_error($ch));
	}
	
	//close connection
	curl_close($ch);
	
	return($result); 
}

function my_json_query($querystring, $endpoint='http://sparql.hegroup.org/sparql'){
	$fields = array();
	$fields['default-graph-uri'] = '';
	$fields['format'] = 'application/sparql-results+json';
	$fields['debug'] = 'on';
	$fields['query'] = $querystring;
	
	//error_log($querystring, 3, '/tmp/error.log');
	$json = my_curl_post_contents($endpoint, $fields);
//	print($json);
	
	$json = json_decode($json);
	$results = array();
	if (isset($json->results->bindings)){
		foreach ($json->results->bindings as $binding) {
			$binding = get_object_vars($binding);
			$result = array();
			foreach ($binding as $key=>$value) {
				$result[$key] = $value->value;
			}
			$results[] = $result;
		}
	}
	
	
//	print_r($results);
	return($results);
}

$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$strSql = "SELECT geneSymbol1, geneSymbol2, keywords FROM t_sentence_hit_gene2gene WHERE in_ifng_network=1 ";

//print($strSql);

$rs = $db->Execute($strSql);
if (!$rs->EOF){
	$querstring='select * from <http://purl.obolibrary.org/obo/merged/INO>
where {?s rdfs:label ?l .
?s <http://purl.obolibrary.org/obo/IAO_0000116> ?o .
filter regex(?o, "^Literature mining terms: ", "i")
}';
	$sparql_results = my_json_query($querstring);
	
	$array_ino_terms=array();
	foreach($sparql_results as $sparql_result) {
		$keywords=preg_split('/, /', str_replace('Literature mining terms: ', '', $sparql_result['o']));
		foreach($keywords as $keyword) {
			$array_ino_terms[$keyword]=array('l'=>$sparql_result['l'], 's'=>$sparql_result['s']);
		}
		
	}

	foreach ($rs as $ignet) {
		if (isset($array_ino_terms[$ignet['keywords']]['s'])) {
?>
<?php echo $ignet['geneSymbol1']?>	<?php echo $ignet['geneSymbol2']?>	<?php echo str_replace('http://purl.obolibrary.org/obo/', '', $array_ino_terms[$ignet['keywords']]['s'])?>

<?php 
		}
	}
}
?>
