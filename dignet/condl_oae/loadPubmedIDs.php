<?php
//load pmids into table t_pubmed_query
include('../../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$lines = file("oae_ids.txt", FILE_IGNORE_NEW_LINES);

foreach($lines as $line){
	$tokens = preg_split('/\t/', $line);
	
	$c_query_id = createRandomPassword();
	$c_query_text = $tokens[0];
	
	$oae_id=$tokens[1];

	$querystring="
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix owl: <http://www.w3.org/2002/07/owl#>

SELECT ?path ?link ?label
FROM <http://purl.obolibrary.org/obo/merged/OAE>

WHERE
{
{
SELECT ?s ?o ?label
WHERE
{{
?s rdfs:subClassOf ?o .
FILTER (isURI(?o)).
OPTIONAL {?o rdfs:label ?label}
}
UNION
{
?s owl:equivalentClass ?s1 .
?s1 owl:intersectionOf ?s2 .
?s2 rdf:first ?o  .
FILTER (isURI(?o))
OPTIONAL {?o rdfs:label ?label}
}
}
} OPTION (TRANSITIVE, t_in(?o), t_out(?s), t_step (?s) as ?link, t_step ('path_id') as ?path).
FILTER (isIRI(?s)).
FILTER (?o= <$oae_id>)
}";	


	print($oae_id.PHP_EOL);
	$results = json_query($querystring);
	
	$oae_ids = array(str_replace('http://purl.obolibrary.org/obo/', '', $oae_id) => 1);
	foreach($results as $result) {
		$oae_ids[str_replace('http://purl.obolibrary.org/obo/', '', $result['link'])]=1;
	}
	
	
	$strSql = "SELECT pmid FROM sentence_oae where term_id in ('".join("', '", array_keys($oae_ids))."')";
	$rs = $db->Execute($strSql);
	
	$pmids=array();
	
	foreach($rs as $row) {
		$pmids[$row['pmid']] =1;
	}

	$strPMIDs = join(",", array_keys($pmids));
	
	$strSql = "REPLACE INTO `ignet`.`t_pubmed_query` (c_query_text, c_pubmed_records, c_query_id, c_project_id)
VALUES
('$c_query_text', '$strPMIDs', '$c_query_id', 'Cardiotoxicity_oae');
";
	$db->Execute($strSql);
}
?>