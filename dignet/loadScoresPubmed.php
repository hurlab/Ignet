<!DOCTYPE html>
<html lang="en"><!-- InstanceBegin template="/Templates/main.dwt.php" codeOutsideHTMLIsLocked="false" -->
<head>
<!-- InstanceBeginEditable name="doctitle" -->
<title>Ignet</title>
<!-- InstanceEndEditable -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          navy: '#1a365d',
          'navy-dark': '#102a4c',
          accent: '#ed8936',
          success: '#38a169',
          background: '#f7fafc',
          text: '#1a202c',
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        },
      }
    }
  }
</script>
<link href="../css/bmain.css" rel="stylesheet" type="text/css" />
<!-- InstanceBeginEditable name="head" --><!-- InstanceEndEditable -->
</head>
<body class="bg-[#f7fafc] text-[#1a202c] font-sans" id="main_body">
<?php
include('../inc/template_top.php');
?>
<main class="max-w-7xl mx-auto px-4 py-6">
    <!-- InstanceBeginEditable name="Main" -->
<h3>Centrality Calculation Results</h3>
<p>This program calculates four types of centraility scores (Degree, Eigenvector, Closeness, and Betweenness). 
<br/><em>Note </em>: Some results may not show due to an outdated centrality calculation program used. Alternatives are being tested.</p>

<?php
//phpinfo(); //benu
include('../inc/functions.php'); //benu
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(0);
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);

$c_query_id = $vali->getInput('c_query_id', 'Query ID', 2, 60);

#$output = shell_exec("python3 test.py --delim '\\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i network.graph 2>&1"); //benu (testing python output)
#echo "<pre>$output</pre>";


$strSql = "SELECT * FROM t_pubmed_query where c_query_id = " . $db->qstr($c_query_id);
$rs = $db->Execute($strSql);

if (!$rs->EOF) {
	$pubmedRecords=$rs->Fields('c_pubmed_records');
	$keywords = $rs->Fields('c_query_text');
	$safePmids = implode(',', array_map('intval', explode(',', $pubmedRecords)));

	$strSql = "SELECT geneSymbol1, geneSymbol2 FROM t_sentence_hit_gene2gene_Host where pmid in ($safePmids)";
	
	$pairs=array();
	
	//echo "start ..";
	//echo $strSql;
	$rs = $db->Execute($strSql);
	foreach ($rs as $row) {
				
		if (!isset($pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]) && !isset($pairs[$row['geneSymbol2']."\t".$row['geneSymbol1']])) $pairs[$row['geneSymbol1']."\t".$row['geneSymbol2']]=1;
		
	}
	//echo "start .. before ";
	//emty data for query id = "ocvzi4gu";
	$strSql = "SELECT * from t_centrality_score_dignet_backup where c_query_id=" . $db->qstr($c_query_id) . " order by score desc";
	$rs = $db->Execute($strSql);
	//echo "strsql".$strSql."...end";
	//if (!$rs->EOF) {
		
		$userfolder = preg_replace('/[^a-zA-Z0-9_-]/', '', $c_query_id);
		$work_dir=dirname(__FILE__)."/userfiles/$userfolder";
		if (!file_exists($work_dir)) {
			mkdir($work_dir);
		}
		
		chdir($work_dir);

		file_put_contents("$work_dir/network.graph", join("\n", array_keys($pairs)));
		
		//                $message = shell_exec("python3 ../../test.py --delim '\\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i network.graph 2>&1"); //benu
//print($work_dir); // benu (just checking if the path matches)
		
		//print("/data/var/projects/ignet/code/clairlib-core-1.08/util/print_network_stats.pl --delim '\\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i network.graph");
		
		//exec("perl /data/var/projects/ignet/code/clairlib-core-1.08/util/print_network_stats.pl --delim '\\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i network.graph");
		
		//putenv("PERL5LIB=/data/var/projects/ignet/code/clairlib-core-1.08/lib:/usr/local/share/perl5/:/var/local/lib/perl5/site_perl/5.22.0/x86_64-linux:/var/local/lib/perl5/site_perl/5.22.0:/var/local/lib/perl5/5.22.0/x86_64-linux:/var/local/lib/perl5/5.22.0");
		//putenv("PERL5LIB=/var/local/lib/perl5/5.22.0");
		//Oliver note: the following lines of code came from the debugging by Jungunk and me on 3/26/2022. 
		putenv("PERL5LIB=/data/var/projects/ignet/code/clairlib-core-1.08/lib:PERL5LIB=/usr/share/perl5");  // Junguk			
		$message = shell_exec("python3 ../../calculate_network_scores.py --delim '\\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality --eigenvector-centrality -i network.graph 2>&1"); //benu

		//$message = shell_exec("python3 ../../calculate_network_scores.py --delim '\\t' --undirected --force --degree-centrality --betweenness-centrality --closeness-centrality -i network.graph 2>&1"); //benu
		//$message = shell_exec("pwd");
		//print_r($message);
		//print_r(exec("/data/var/www/html/ignet/dignet/clair.sh $work_dir"));
		
		shell_exec("perl /data/var/projects/ignet/code/run_pagerank.pl network.graph > network.pagerank-centrality");
		
		//$db->options(MYSQLI_OPT_LOCAL_INFILE, true); //benu
		if (!is_readable("$work_dir/network.betweenness-centrality")) { //benu
		echo "file cannot be read";
		}

		//echo "work dir ...";
		//echo $work_dir; //benu
		//test the lines
		//$sql =  "LOAD DATA LOCAL INFILE '$work_dir/network.betweenness-centrality' INTO TABLE t_centrality_score_dignet COLUMNS TERMINATED BY ' ' SET score_type='b', c_query_id='$userfolder'";
		
		try{ //benu
		$qUserfolder = $db->qstr($userfolder);
		if (file_exists("$work_dir/network.betweenness-centrality")) {
			$db->Execute("LOAD DATA LOCAL INFILE " . $db->qstr("$work_dir/network.betweenness-centrality") . " INTO TABLE t_centrality_score_dignet COLUMNS TERMINATED BY ' ' SET score_type='b', c_query_id=$qUserfolder");
		}
		else{
		echo "network.betweeness-centrality doesnot exist";
		}
	//check for betweeness centrality
		if (file_exists("$work_dir/network.closeness-centrality")) {
                        $db->Execute("LOAD DATA LOCAL INFILE " . $db->qstr("$work_dir/network.closeness-centrality") . " INTO TABLE t_centrality_score_dignet COLUMNS TERMINATED BY ' ' SET score_type='c', c_query_id=$qUserfolder");

                }
                else{
                echo "network.closeness-centrality doesnot exist";
                }
		//check for closeness centrality

		if (file_exists("$work_dir/network.degree-centrality")) {
                        $db->Execute("LOAD DATA LOCAL INFILE " . $db->qstr("$work_dir/network.degree-centrality") . " INTO TABLE t_centrality_score_dignet COLUMNS TERMINATED BY ' ' SET score_type='d', c_query_id=$qUserfolder");

                }
                else{
                echo "network.degree-centrality doesnot exist";
                }
                        //check for degree centrality
		if (file_exists("$work_dir/network.eigenvector-centrality")) {
                        $db->Execute("LOAD DATA LOCAL INFILE " . $db->qstr("$work_dir/network.eigenvector-centrality") . " INTO TABLE t_centrality_score_dignet COLUMNS TERMINATED BY ' ' SET score_type='e', c_query_id=$qUserfolder");

                	}
                else{
                echo "network.eigenvector-centrality doesnot exist";
                }
                        //check for eigenvector centrality

		if (file_exists("$work_dir/network.pagerank-centrality")) {
                        $db->Execute("LOAD DATA LOCAL INFILE " . $db->qstr("$work_dir/network.pagerank-centrality") . " INTO TABLE t_centrality_score_dignet COLUMNS TERMINATED BY ' ' SET score_type='p', c_query_id=$qUserfolder");

                        }
                else{
                echo "network.pagerank-centrality doesnot exist";
                }
                        //check for pagerank centrality 
		
		
		if (!file_exists("$work_dir/network.graph")) {
                        echo "File does not exist<br>";

                        //echo "$work_dir/network.betweenness-centrality";
                }
		

		//echo "hello... success ...";
		} catch(Exception $e) {
   		echo "something went wrong";	
	       	// Code to handle the exception
		}
	//}
	
	$genes = array();
	$strSql = "SELECT * from t_centrality_score_dignet where c_query_id=" . $db->qstr($c_query_id) . " order by score desc";
	//echo $strSql;
	$rs = $db->Execute($strSql);
	//echo "printing query id";
	//echo $c_query_id;
	//echo "<br><br><br><br><br> loop starts here";
	foreach($rs as $row) {
		//print_r($row);
		$genes[$row['score_type']][]=$row;
	}
	//echo "<pre>";
	//print_r($genes);
	//echo "</pre>";
	
	
?>
<p> Keywords: <?php echo htmlspecialchars($keywords, ENT_QUOTES, 'UTF-8')?>.</p>
<p> Found <a href="searchPubmed.php?keywords=<?php echo urlencode($keywords)?>"><?php echo sizeof($pairs)?> gene pairs</a>. Below are the results of centrality scores for each gene based on different centrality calculations:</p>

<table border="0" cellpadding="4" bgcolor="#FFFFFF">
  <tr>
    <td colspan="3" bgcolor="#E4E4E4" class="styleLeftColumn">Degree centrality</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn" colspan="3">Eigenvector centrality</td>

    <td bgcolor="#E4E4E4" class="styleLeftColumn" colspan="2">Closeness centrality</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn" colspan="2">Betweenness centrality</td>
  </tr>
  <tr>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">#</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">Gene</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">Score</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">#</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">Gene</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">Score</td>

    <td bgcolor="#E4E4E4" class="styleLeftColumn">Gene</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">Score</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">Gene</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">Score</td>
  </tr>
  <?php 
	$bgcolor="#F4F9FD";
	if(sizeOf($genes)>0){
	
		for($i=0; $i<sizeof($genes['d']); $i++) {
			if ($bgcolor=="#F4F9FD") {
				$bgcolor="#F7F7E1";
			}
			else {
				$bgcolor="#F4F9FD";
			}
			  
?>
  <tr>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo($i+1)?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><a href="geneDetail.php?geneSymbol1=<?php echo urlencode($genes['d'][$i]['genesymbol'])?>&c_query_id=<?php echo urlencode($c_query_id)?>"><?php echo htmlspecialchars($genes['d'][$i]['genesymbol'], ENT_QUOTES, 'UTF-8')?></a></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo round($genes['d'][$i]['score'], 4)?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo($i+1)?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><a href="geneDetail.php?geneSymbol1=<?php echo urlencode($genes['e'][$i]['genesymbol'])?>&c_query_id=<?php echo urlencode($c_query_id)?>"><?php echo htmlspecialchars($genes['e'][$i]['genesymbol'], ENT_QUOTES, 'UTF-8')?></a></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo round($genes['e'][$i]['score'], 4)?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo htmlspecialchars($genes['c'][$i]['genesymbol'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo htmlspecialchars($genes['c'][$i]['score'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo htmlspecialchars($genes['b'][$i]['genesymbol'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo htmlspecialchars($genes['b'][$i]['score'], ENT_QUOTES, 'UTF-8')?></td>
  </tr>
	 <?php 
		}	}
	?>
</table>
  <?php 
}
?>

    <!-- InstanceEndEditable -->
</main>
<?php include('../inc/template_footer.php'); ?>
</body>
<!-- InstanceEnd --></html>
