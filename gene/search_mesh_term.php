<?php 
include('../inc/functions.php');
$db = ADONewConnection($driver);
$db->Connect($host, $username, $password, $database);

$vali=new Validation($_REQUEST);
$c_species = $vali->getInput('c_species', 'Species', 1, 60, true);
$keywords = $vali->getInput('keywords', 'Keywords', 1, 60, true);
$tkeywords = transformKeywords($keywords);

$order_by = $vali->getInput('order_by', 'Order by', 0, 20);
$order = $vali->getInput('order', 'Order', 0, 20);
$order_by = $order_by=='' ? 'heading':$order_by;
$order = $order=='' ? 'ASC':$order;

$params = "?c_species=$c_species&keywords=$keywords";

if (strlen($vali->getErrorMsg())==0) { 

	$strSql="SELECT * FROM dic_mesh_desc where match (heading, scope_note) against ('$tkeywords' in boolean mode)";
	
	$strSql.= "order by $order_by $order";
	$rs = $db->Execute($strSql);
	if (!$rs->EOF) {
		$array_term = $rs->GetArray();
			
		$meshuis = array();
		foreach($array_term as $term) {
			$meshuis[$term['mesh_UI']]=array();
		}
		
		$strSql="SELECT * FROM dic_mesh_tree where mesh_UI in ('".join("','", array_keys($meshuis))."')";
		$rs = $db->Execute($strSql);
		if (!$rs->EOF) {
			$array_mesh_string = $rs->GetArray();
			foreach($array_mesh_string as $mesh_string) {
				$meshuis[$mesh_string['mesh_UI']][] = $mesh_string['tree_string'];
			}
		}
?>
<p><b>Search MeSH for <?php echo $keywords?></b></p>
<table border="0" cellpadding="4" bgcolor="#FFFFFF">
  <tr>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php 
	if ($order_by=='mesh_UI') {
	
		if ($order == 'ASC') {
			$params0 = $params."&order_by=mesh_UI&order=DESC";
?>
<img src="../images/asc.gif" alt="ASC" />
<?php 		
		}
		else {
			$params0 = $params."&order_by=mesh_UI&order=ASC";
?>
<img src="../images/desc.gif" alt="DESC" />
<?php 		
		}
	
	}
	else {
		$params0 = $params."&order_by=mesh_UI&order=ASC";
	}
?>
      <a href="javascript:div_results1.setHref('search_mesh_term.php<?php echo $params0?>')" title="Sort by MeSH UI">MeSH UI</a>	</td>
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
      <a href="javascript:div_results1.setHref('search_mesh_term.php<?php echo $params0?>')" title="Sort by MeSH Term">MeSH Term</a>	</td>
    <td bgcolor="#E4E4E4" class="styleLeftColumn">
<?php 
	if ($order_by=='scope_note') {
	
		if ($order == 'ASC') {
			$params0 = $params."&order_by=scope_note&order=DESC";
?>
<img src="../images/asc.gif" alt="ASC" />
<?php 		
		}
		else {
			$params0 = $params."&order_by=scope_note&order=ASC";
?>
<img src="../images/desc.gif" alt="DESC" />
<?php 		
		}
	
	}
	else {
		$params0 = $params."&order_by=scope_note&order=ASC";
	}
?>
      <a href="javascript:div_results1.setHref('search_mesh_term.php<?php echo $params0?>')" title="Sort by Raw Hits">Scope Note</a>	</td>
    </tr>
<?php 
		$bgcolor="#F4F9FD";
		foreach($array_term as $term) {
			if ($bgcolor=="#F4F9FD") {
				$bgcolor="#F7F7E1";
			}
			else {
				$bgcolor="#F4F9FD";
			}
?>
  <tr>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo $term['mesh_UI']?></td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo $term['heading']?> 
<?php 
		for($i=1; $i<=sizeof($meshuis[$term['mesh_UI']]); $i++) {
?>
			[<a href="../meshbrowse/index.php?c_species=<?php echo $c_species?>&c_final_edge=<?php echo $meshuis[$term['mesh_UI']][$i-1]?>"><?php echo $i?></a>] 
<?php 
		}
?>	</td>
    <td bgcolor="<?php echo $bgcolor?>" class="smallContent"><?php echo $term['scope_note']?></td>
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
<p align="center">Please enter a keyword!</p>
<?php 
}
?>
