<?php 
include('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);
$c_species = $vali->getInput('c_species', 'Species', 1, 60, true);
$c_gene_name = $vali->getInput('c_gene_name', 'Gene Name', 1, 60, true);
$c_gene_name = sanitizeGeneSymbol($c_gene_name);

$order_by = $vali->getInput('order_by', 'Order by', 0, 20);
$order = $vali->getInput('order', 'Order', 0, 20);
$order_by = $order_by=='' ? 'c_weighted_hits':$order_by;
$order = $order=='' ? 'DESC':$order;
$order_by = sanitizeOrderBy($order_by, ['c_mesh_UI','heading','c_hits','c_weighted_hits'], 'c_weighted_hits');
$order = sanitizeOrder($order);

$params = "?c_species=" . htmlspecialchars($c_species, ENT_QUOTES, 'UTF-8') . "&c_gene_name=" . htmlspecialchars($c_gene_name, ENT_QUOTES, 'UTF-8');

$included_taxids = array();
$included_taxids['Escherichia coli'] = '405955, 481805, 199310, 331111, 331112, 155864, 386585, 439855, 364106, 316385, 511145, 316407';
$included_taxids['Brucella'] = '430066, 262698, 483179, 224914, 359391, 444178, 204722, 470137';


if (strlen($vali->getErrorMsg())==0) { 

	$strSql="SELECT distinct c_mesh_UI,heading,c_hits,c_weighted_hits FROM t_gene_list, dic_mesh_desc where t_gene_list.c_mesh_UI=dic_mesh_desc.mesh_UI AND c_species = " . $db->qstr($c_species) . " AND c_gene_name = " . $db->qstr($c_gene_name);

	$strSql.= " order by $order_by $order";
	$rs = $db->Execute($strSql);
	if (!$rs->EOF) {
		$array_gene_list = $rs->GetArray();
			
		$meshuis = array();
		foreach($array_gene_list as $gene_list) {
			$meshuis[$gene_list['c_mesh_UI']]=array();
		}
		
		$strSql="SELECT * FROM dic_mesh_tree where mesh_UI in ('".join("','", array_keys($meshuis))."')";
		$rs = $db->Execute($strSql);
		if (!$rs->EOF) {
			$array_mesh_string = $rs->GetArray();
			foreach($array_mesh_string as $mesh_string) {
				$meshuis[$mesh_string['mesh_UI']][] = $mesh_string['tree_string'];
			}
		}

		$search_species=urlencode($c_species);
		
		$strSql="select * from t_gene_annotation where symbol = " . $db->qstr($c_gene_name) . " and species = " . $db->qstr($c_species);
		$rs = $db->Execute($strSql);
		$synonyms = array();
		$description = array();
		if (!$rs->EOF) {
			foreach($rs as $gene_info) {
				if ($gene_info['synonyms']!='-') $synonyms[] = $gene_info['synonyms'];
				if ($gene_info['description']!='-') $description[] = $gene_info['description'];
			}
		}
		
		$synonyms = array_unique($synonyms);
		$description = array_unique($description);
?>
<p><b>Gene-related MeSH Profile of <a href="http://www.phidias.us/phigen/query/gene_query_process.php?species=<?php echo htmlspecialchars($search_species, ENT_QUOTES, 'UTF-8')?>&gene_name=<?php echo htmlspecialchars($c_gene_name, ENT_QUOTES, 'UTF-8')?>"><?php echo htmlspecialchars($c_gene_name, ENT_QUOTES, 'UTF-8')?></a></b></p>
<?php
		if (!empty($synonyms)) {
?><p style="font-size:12px">Also known as: <?php echo htmlspecialchars(preg_replace('/\|/', ', ', join(', ', $synonyms)), ENT_QUOTES, 'UTF-8')?></p>
<?php
		}
		if (!empty($description)) {
?><p style="font-size:12px">Description: <?php echo htmlspecialchars(join(', ', $description), ENT_QUOTES, 'UTF-8')?></p>
<?php 		
		}
?>
<table border="0" cellpadding="4" bgcolor="#FFFFFF">
  <tr>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php 
	if ($order_by=='c_mesh_UI') {
	
		if ($order == 'ASC') {
			$params0 = $params."&order_by=c_mesh_UI&order=DESC";
?>
<img src="../images/asc.gif" alt="ASC" />
<?php 		
		}
		else {
			$params0 = $params."&order_by=c_mesh_UI&order=ASC";
?>
<img src="../images/desc.gif" alt="DESC" />
<?php 		
		}
	
	}
	else {
		$params0 = $params."&order_by=c_mesh_UI&order=ASC";
	}
?>
      <a href="javascript:div_results1.setHref('gene_profile.php<?php echo $params0?>')" title="Sort by MeSH UI">MeSH UI</a> 
	
	</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php 
	if ($order_by=='heading') {
	
		if ($order == 'ASC') {
			$params0 = $params."&order_by=heading&order=DESC";
?>
<img src="../images/asc.gif" alt="ASC" />
<?php 		
		}
		else {
			$params0 = $params."&order_by=heading&order=ASC";
?>
<img src="../images/desc.gif" alt="DESC" />
<?php 		
		}
	
	}
	else {
		$params0 = $params."&order_by=heading&order=ASC";
	}
?>
      <a href="javascript:div_results1.setHref('gene_profile.php<?php echo $params0?>')" title="Sort by MeSH Term">MeSH Term</a> 
	</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php 
	if ($order_by=='c_hits') {
	
		if ($order == 'ASC') {
			$params0 = $params."&order_by=c_hits&order=DESC";
?>
<img src="../images/asc.gif" alt="ASC" />
<?php 		
		}
		else {
			$params0 = $params."&order_by=c_hits&order=ASC";
?>
<img src="../images/desc.gif" alt="DESC" />
<?php 		
		}
	
	}
	else {
		$params0 = $params."&order_by=c_hits&order=ASC";
	}
?>
      <a href="javascript:div_results1.setHref('gene_profile.php<?php echo $params0?>')" title="Sort by Raw Hits">Raw Hits</a> 
	</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php 
	if ($order_by=='c_weighted_hits') {
	
		if ($order == 'ASC') {
			$params0 = $params."&order_by=c_weighted_hits&order=DESC";
?>
<img src="../images/asc.gif" alt="ASC" />
<?php 		
		}
		else {
			$params0 = $params."&order_by=c_weighted_hits&order=ASC";
?>
<img src="../images/desc.gif" alt="DESC" />
<?php 		
		}
	
	}
	else {
		$params0 = $params."&order_by=c_weighted_hits&order=ASC";
	}
?>
      <a href="javascript:div_results1.setHref('gene_profile.php<?php echo $params0?>')" title="Sort by Weighted Hits">Weighted Hits</a> 
	</td>
  </tr>
<?php 
		$bgcolor="#F4F9FD";
		foreach($array_gene_list as $gene_list) {
			if ($bgcolor=="#F4F9FD") {
				$bgcolor="#F7F7E1";
			}
			else {
				$bgcolor="#F4F9FD";
			}
?>
  <tr>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo htmlspecialchars($gene_list['c_mesh_UI'], ENT_QUOTES, 'UTF-8')?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo htmlspecialchars($gene_list['heading'], ENT_QUOTES, 'UTF-8')?>
<?php
		for($i=1; $i<=sizeof($meshuis[$gene_list['c_mesh_UI']]); $i++) {
?>
			[<a href="../meshbrowse/index.php?c_species=<?php echo htmlspecialchars($c_species, ENT_QUOTES, 'UTF-8')?>&c_final_edge=<?php echo htmlspecialchars($meshuis[$gene_list['c_mesh_UI']][$i-1], ENT_QUOTES, 'UTF-8')?>"><?php echo $i?></a>]
<?php
		}
?>
	</td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo (int)$gene_list['c_hits']?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo sprintf('%.6f', (float)$gene_list['c_weighted_hits'])?></td>
  </tr>
<?php 
		}
?>
</table>
<?php 
	}
	else {
?>
No records returned! 
<?php 
	}
	$rs->close();
}
else {
?>
<p align="center">&nbsp; </p>
<p align="center">Please select a gene!</p>
<?php 
}
?>
