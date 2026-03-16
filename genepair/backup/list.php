<?php 
include_once('../inc/functions.php');

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

function my_json_query($querystring, $endpoint='http://172.20.30.209:8890/sparql'){
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

$vali=new Validation($_REQUEST);

$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);

$geneSymbol1 = $vali->getInput('geneSymbol1', 'ignet 1', 2, 60);
$geneSymbol2 = $vali->getInput('geneSymbol2', 'ignet 2', 2, 60);
$hasVaccine = $vali->getInput('hasVaccine', '"Vaccine" metioned?', 0, 10);

$orderBy = $vali->getInput('orderBy', 'Order by', 0, 60);
$order = $vali->getInput('order', 'Accending or Decending', 0, 60);
$currPage = $vali->getNumber('currPage', 'Current Page', 1, 5);

$strSql = "SELECT c_hit_id FROM t_sentence_hit_gene2gene WHERE ";
$strSql .= "  ((geneSymbol1 = '$geneSymbol1' AND geneSymbol2 = '$geneSymbol2') OR (geneSymbol2 = '$geneSymbol1' AND geneSymbol1 = '$geneSymbol2'))";

if ($hasVaccine != '') {
	$strSql .= " AND hasVaccine = $hasVaccine";
}

if ($keywords != '') {
	$tkeywords = transformKeywords($keywords);
	$strSql .= " AND MATCH(sentence) AGAINST ('$tkeywords' IN BOOLEAN MODE)";
}

if ($orderBy != '') {
	$strSql .= " ORDER BY $orderBy $order";
}

//print($strSql);

$rs = $db->Execute($strSql);
if (!$rs->EOF)
{
	$array_c_hit_ids = $rs->GetArray();
	$rs->close();

	$numOfRecords = sizeof($array_c_hit_ids);
	
	$recordsPerPage = 50;
	$numOfPage = ceil($numOfRecords / $recordsPerPage);
	
	if ($currPage == '' || $currPage > $numOfPage || $numOfPage < 1) {
		$currPage = 1;
	}
	$score = 0; //Edison: No cutoff
	$params = "list.php?geneSymbol1=$geneSymbol1&geneSymbol2=$geneSymbol2&score=$score&hasVaccine=$hasVaccine&keywords=$keywords";
	$params = addslashes($params);

	$a_ignets = array();
	for ($i= ($currPage-1)*$recordsPerPage; $i < $currPage*$recordsPerPage && $i < $numOfRecords; $i++) {
		$a_ignets[] = $array_c_hit_ids[$i]['c_hit_id'];
	}
	
	$ignets = implode("','", $a_ignets);

#	$strSql = "select * FROM t_sentence_hit_gene2gene where c_hit_id in ('$ignets')";
	$strSql = "select * FROM t_sentence_hit_gene2gene left join sentence_vaccine on t_sentence_hit_gene2gene.PMID=sentence_vaccine.pmid where c_hit_id in ('$ignets')";

	if ($orderBy != '') {
		$strSql .= " ORDER BY $orderBy $order";
	}
	
	//print($strSql);

	$rs = $db->Execute($strSql);
	$array_ignet = array();
	if (!$rs->EOF) {
		$array_ignet = $rs->GetArray();
		$rs->close();
	}
	
	/*
	$querstring='select * from <http://purl.obolibrary.org/obo/merged/INO>
where {?s rdfs:label ?l .
?s <http://purl.obolibrary.org/obo/IAO_0000116> ?o .
filter regex(?o, "^Literature mining terms: ", "i")
}';
	*/
	$querstring='select * from <http://purl.obolibrary.org/obo/merged/INO>
where {?s rdfs:label ?l .
?s <http://purl.obolibrary.org/obo/INO_0000006> ?o .
}';
	

	$sparql_results = my_json_query($querstring);
	
	$array_ino_terms=array();
	foreach($sparql_results as $sparql_result) {
		$tmp_keywords=preg_split('/, /', str_replace('Literature mining terms: ', '', $sparql_result['o']));
		foreach($tmp_keywords as $tmp_keyword) {
			$array_ino_terms[$tmp_keyword]=array('l'=>$sparql_result['l'], 's'=>$sparql_result['s']);
		}
		
	}

?>
<p> Found
	<?php echo sizeof($array_c_hit_ids)?>
	record(s).  </p>
<table border="0">
	<tr>
		<td bgcolor="#F5FAF7" class="tdData" style="padding-left:20px; padding-right:20px "><strong>Record:</strong>
				<?php echo (($currPage-1) * $recordsPerPage + 1)?>
			to
			<?php echo ($currPage * $recordsPerPage) < $numOfRecords? ($currPage * $recordsPerPage) :$numOfRecords?>
			of
			<?php echo $numOfRecords?>
			Records. </td>
		<td bgcolor="#F5FAF7" class="tdData" style="padding-left:20px; padding-right:20px "><strong>Page:</strong>
				<?php echo $currPage?>
			of
			<?php echo $numOfPage?>
			,
			<?php 
	if ($currPage > 1) {
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params?>&currPage=1')">First</span>
			<?php 
	}
	else {
?>
			First
			<?php 
	}
?>
			,
			<?php 
	if ($currPage > 1) {
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params?>&currPage=<?php echo $currPage-1?>')">Previous </span>
			<?php 
	}
	else {
?>
			Previous
			<?php 
	}
?>
			,
			<?php 
	if ($currPage < $numOfPage) {
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params?>&currPage=<?php echo $currPage+1?>')">Next</span>
			<?php 
	}
	else {
?>
			Next
			<?php 
	}
?>
			,
			<?php 
	if ($currPage < $numOfPage) {
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params?>&currPage=<?php echo $numOfPage?>')">Last</span>
			<?php 
	}
	else {
?>
			Last
			<?php 
	}
?>
		</td>
	</tr>
</table>
<table border="0" cellpadding="2" cellspacing="2">
	<tr>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">PubMed</td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='geneSymbol1') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=geneSymbol1&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=geneSymbol1&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=geneSymbol1&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params0?>')" title="Sort by Gene1">Gene1</span> </td>
		<td height="25" align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='geneSymbol2') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=geneSymbol2&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=geneSymbol2&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=geneSymbol2&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params0?>')" title="Sort by Gene1">Gene2</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='geneMatch1') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=geneMatch1&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=geneMatch1&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=geneMatch1&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params0?>')" title="Sort by Gene1">Match1</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='geneMatch2') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=geneMatch2&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=geneMatch2&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=geneMatch2&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params0?>')" title="Sort by Gene1">Match2</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='Score') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=Score&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=Score&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=Score&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params0?>')" title="Sort by Gene1">Score</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn"><?php 
	if ($orderBy=='hasVaccine') {
	
		if ($order == 'ASC') {
			$params0 = $params."&orderBy=hasVaccine&order=DESC";
?>
				<img src="../images/asc.gif" alt="ASC" />
				<?php 		
		}
		else {
			$params0 = $params."&orderBy=hasVaccine&order=ASC";
?>
				<img src="../images/desc.gif" alt="DESC" />
				<?php 		
		}
	
	}
	else {
		$params0 = $params."&orderBy=hasVaccine&order=ASC";
	}
?>
			<span style="cursor:pointer" onclick="reloadDiv(div_results2, '<?php echo $params0?>')" title="Sort by Gene1">&quot;Vaccine&quot; mentioned</span> </td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">Sentence</td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">INO Interaction</td>
		<td align="center" bgcolor="#A5C3D6" class="styleLeftColumn">VO vaccine(s) mentioned in abstract</td>
	</tr>
	<?php 
	foreach ($array_ignet as $ignet) {
		$hkeywords = array($ignet['geneMatch1'], $ignet['geneMatch2'],  $ignet['keywords']);
		if ($keywords!='') $hkeywords[]=$keywords;
?>
	<tr>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><a href="http://www.ncbi.nlm.nih.gov/pubmed/<?php echo $ignet['PMID']?>" target="_blank">
			<?php echo $ignet['PMID']?>
		</a></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $ignet['geneSymbol1']?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $ignet['geneSymbol2']?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $ignet['geneMatch1']?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $ignet['geneMatch2']?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $ignet['score']?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo $ignet['hasVaccine']?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><?php echo formatOutput($ignet['sentence'], $hkeywords)?></td>
		<td bgcolor="#F5FAF7" style=" font-size:12px">
<?php 
	if (isset($array_ino_terms[$ignet['keywords']])) {
?>
<a target="_blank" href="http://www.ontobee.org/browser/rdf.php?o=INO&iri=<?php echo $array_ino_terms[$ignet['keywords']]['s']?>"><?php echo $array_ino_terms[$ignet['keywords']]['l']?></a>
<?php 		
	}
?>
        </td>
		<td bgcolor="#F5FAF7" style=" font-size:12px"><a href="http://purl.obolibrary.org/obo/<?php echo $ignet['term_id']?>"><?php echo $ignet['matching_term'];?></a></td>
	</tr>
	<?php 
	}
?>
</table>
<p align="center">&nbsp; </p>
<?php 
}
else {
?>
<p align="center">&nbsp; </p>
<p align="center">No record was found. Please use different criteria. </p>
<?php 
}
?>

