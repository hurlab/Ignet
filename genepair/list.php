<?php 
include_once('../inc/functions.php');

function my_curl_post_contents($url, $fields) {
    $ch = curl_init();
    $fields_string = http_build_query($fields);
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_POST,count($fields));
    curl_setopt($ch,CURLOPT_POSTFIELDS,$fields_string);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    if ($result === false) error_log("curl error: " . curl_error($ch));
    curl_close($ch);
    return($result);
}

function my_json_query($querystring, $endpoint='http://172.20.30.209:8890/sparql') {
    $fields = array(
        'default-graph-uri' => '',
        'format' => 'application/sparql-results+json',
        'debug' => 'on',
        'query' => $querystring
    );
    $json = my_curl_post_contents($endpoint, $fields);
    $json = json_decode($json);
    $results = array();
    if (isset($json->results->bindings)) {
        foreach ($json->results->bindings as $binding) {
            $binding = get_object_vars($binding);
            $result = array();
            foreach ($binding as $key => $value) {
                $result[$key] = $value->value;
            }
            $results[] = $result;
        }
    }
    return($results);
}

$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali = new Validation($_REQUEST);
$keywords = $vali->getInput('keywords', 'Keywords', 0, 60);
$geneSymbol1 = $vali->getInput('geneSymbol1', 'ignet 1', 2, 60);
$geneSymbol2 = $vali->getInput('geneSymbol2', 'ignet 2', 2, 60);
$hasVaccine = $vali->getInput('hasVaccine', '"Vaccine" mentioned?', 0, 10);
$orderBy = $vali->getInput('orderBy', 'Order by', 0, 60);
$order = $vali->getInput('order', 'Ascending or Descending', 0, 60);
$currPage = $vali->getNumber('currPage', 'Current Page', 1, 5);

$strSql = "SELECT gene2gene_host_id AS c_hit_id FROM t_sentence_hit_gene2gene_Host WHERE ";
$strSql .= "((geneSymbol1 = " . $db->qstr($geneSymbol1) . " AND geneSymbol2 = " . $db->qstr($geneSymbol2) . ") OR (geneSymbol2 = " . $db->qstr($geneSymbol1) . " AND geneSymbol1 = " . $db->qstr($geneSymbol2) . "))";

if ($hasVaccine != '') {
    $strSql .= " AND hasVaccine = " . (int)$hasVaccine;
}
if ($keywords != '') {
    $tkeywords = transformKeywords($keywords);
    $strSql .= " AND MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
}
$allowedOrderColumns = ['score', 'geneSymbol1', 'geneSymbol2', 'hasVaccine', 'PMID', 'sentenceID'];
$allowedOrderDirs = ['ASC', 'DESC'];
if ($orderBy != '' && in_array($orderBy, $allowedOrderColumns, true)) {
    $safeOrder = in_array(strtoupper($order), $allowedOrderDirs, true) ? strtoupper($order) : 'ASC';
    $strSql .= " ORDER BY $orderBy $safeOrder";
}

// Build COUNT query using the same WHERE clause
$strSqlCount = "SELECT COUNT(*) FROM t_sentence_hit_gene2gene_Host WHERE ";
$strSqlCount .= "((geneSymbol1 = " . $db->qstr($geneSymbol1) . " AND geneSymbol2 = " . $db->qstr($geneSymbol2) . ") OR (geneSymbol2 = " . $db->qstr($geneSymbol1) . " AND geneSymbol1 = " . $db->qstr($geneSymbol2) . "))";

if ($hasVaccine != '') {
    $strSqlCount .= " AND hasVaccine = " . (int)$hasVaccine;
}
if ($keywords != '') {
    $tkeywords = transformKeywords($keywords);
    $strSqlCount .= " AND MATCH(sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
}

$numOfRecords = (int)$db->GetOne($strSqlCount);

if ($numOfRecords > 0) {
    $recordsPerPage = 50;
    $numOfPage = ceil($numOfRecords / $recordsPerPage);
    if ($currPage == '' || $currPage > $numOfPage || $numOfPage < 1) $currPage = 1;

    $score = 0;
    $params = "list.php?geneSymbol1=" . urlencode($geneSymbol1) . "&geneSymbol2=" . urlencode($geneSymbol2) . "&score=" . urlencode($score) . "&hasVaccine=" . urlencode($hasVaccine) . "&keywords=" . urlencode($keywords);

    $offset = ($currPage - 1) * $recordsPerPage;

    $strSqlPage = "SELECT t_sentence_hit_gene2gene_Host.*, t_sentence_hit_gene2gene_Host.sentenceID AS sentenceID, sentences25_genepair.sentence
               FROM t_sentence_hit_gene2gene_Host
               LEFT JOIN sentences25_genepair ON t_sentence_hit_gene2gene_Host.sentenceID = sentences25_genepair.sentenceID
               WHERE ((geneSymbol1 = " . $db->qstr($geneSymbol1) . " AND geneSymbol2 = " . $db->qstr($geneSymbol2) . ") OR (geneSymbol2 = " . $db->qstr($geneSymbol1) . " AND geneSymbol1 = " . $db->qstr($geneSymbol2) . "))";

    if ($hasVaccine != '') {
        $strSqlPage .= " AND hasVaccine = " . (int)$hasVaccine;
    }
    if ($keywords != '') {
        $strSqlPage .= " AND MATCH(t_sentence_hit_gene2gene_Host.sentence) AGAINST (" . $db->qstr($tkeywords) . " IN BOOLEAN MODE)";
    }

    $strSqlPage .= " GROUP BY sentences25_genepair.sentence, t_sentence_hit_gene2gene_Host.PMID";

    if ($orderBy != '' && in_array($orderBy, $allowedOrderColumns, true)) {
        $safeOrder = in_array(strtoupper($order), $allowedOrderDirs, true) ? strtoupper($order) : 'ASC';
        $strSqlPage .= " ORDER BY $orderBy $safeOrder";
    }
    $strSqlPage .= " LIMIT $recordsPerPage OFFSET $offset";

    $rs = $db->Execute($strSqlPage);
    $array_ignet = array();
    if ($rs && !$rs->EOF) {
        $array_ignet = $rs->GetArray();
        $rs->close();
    }

$inoTerms = [];

$sentenceIDs = array_map(function($item) {
    return intval($item['sentenceID']);
}, $array_ignet);

if (!empty($sentenceIDs)) {
    $sentenceIdStr = implode(',', $sentenceIDs);
    $strSqlIno = "SELECT * FROM ino_host25 WHERE sentence_id IN ($sentenceIdStr)";
    $rsIno = $db->Execute($strSqlIno);

    if ($rsIno && !$rsIno->EOF) {
        while (!$rsIno->EOF) {
            $row = $rsIno->fields;
            $inoTerms[$row['sentence_id']][] = [
                'id' => $row['id'],
                'phrase' => $row['matching_phrase']
            ];
            $rsIno->MoveNext();
        }
        $rsIno->close();
    }
}
    

?>
<p>Found <?php echo $numOfRecords?> record(s).</p>

<table border="0">
    <tr>
        <td class="tdData" bgcolor="#F5FAF7">
            <strong>Record:</strong> <?php echo (($currPage-1) * $recordsPerPage + 1)?> to 
            <?php echo ($currPage * $recordsPerPage) < $numOfRecords ? ($currPage * $recordsPerPage) : $numOfRecords?>
            of <?php echo $numOfRecords?> Records.
        </td>
        <td class="tdData" bgcolor="#F5FAF7">
            <strong>Page:</strong> <?php echo $currPage?> of <?php echo $numOfPage?>
        </td>
    </tr>
</table>

<table border="0" cellpadding="2" cellspacing="2">
<tr>
    <td bgcolor="#A5C3D6">PubMed</td>
    <td bgcolor="#A5C3D6">Gene1</td>
    <td bgcolor="#A5C3D6">Gene2</td>
    <td bgcolor="#A5C3D6">Match1</td>
    <td bgcolor="#A5C3D6">Match2</td>
    <td bgcolor="#A5C3D6">Score</td>
    <td bgcolor="#A5C3D6">"Vaccine" mentioned</td>
    <td bgcolor="#A5C3D6">Sentence</td>
    <td bgcolor="#A5C3D6">INO Interaction</td>
    <td bgcolor="#A5C3D6">VO vaccine(s)</td>
</tr>

<?php 
foreach ($array_ignet as $ignet) {
?>
<tr>
    <td bgcolor="#F5FAF7"><a href="http://www.ncbi.nlm.nih.gov/pubmed/<?php echo htmlspecialchars($ignet['PMID'], ENT_QUOTES, 'UTF-8')?>" target="_blank"><?php echo htmlspecialchars($ignet['PMID'], ENT_QUOTES, 'UTF-8')?></a></td>
    <td bgcolor="#F5FAF7"><?php echo htmlspecialchars($ignet['geneSymbol1'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="#F5FAF7"><?php echo htmlspecialchars($ignet['geneSymbol2'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="#F5FAF7"><?php echo htmlspecialchars($ignet['geneMatch1'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="#F5FAF7"><?php echo htmlspecialchars($ignet['geneMatch2'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="#F5FAF7"><?php echo htmlspecialchars($ignet['score'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="#F5FAF7"><?php echo htmlspecialchars($ignet['hasVaccine'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="#F5FAF7"><?php echo htmlspecialchars($ignet['sentence'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="#F5FAF7">
        <?php 
        $sentenceId = $ignet['sentenceID'];
        if (isset($inoTerms[$sentenceId])) {
            $printed = [];
            foreach ($inoTerms[$sentenceId] as $term) {
                if (!in_array($term['phrase'], $printed)) {
                    echo '<a target="_blank" href="http://purl.obolibrary.org/obo/' . $term['id'] . '">' . htmlspecialchars($term['phrase']) . '</a><br>';
                    $printed[] = $term['phrase'];
                }
            }
        } else {
            echo '&nbsp;';
        }
        ?>
    </td>
    <td bgcolor="#F5FAF7">&nbsp;</td>
</tr>
<?php 
} // end foreach
?>
</table>
<?php 
} else {
?>
<p align="center">No record was found. Please use different criteria.</p>
<?php 
}
?>
