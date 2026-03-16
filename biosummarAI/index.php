<?php
ini_set('display_startup_errors', 1);
ini_set('display_errors', 1);
error_reporting(-1);
include('../inc/functions.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Ignet - BioSummarAI Search</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<link rel="shortcut icon" href="/favicon.ico"/>
<link href="../css/bmain.css" rel="stylesheet" type="text/css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
</head>
<body style="margin:0px; background-image:url(../images/bg_2008-08-21.2.gif)" id="main_body">
<?php 
try{
	$db = ADONewConnection($driver);
	$conn = $db->Connect($host, $username, $password, $database);
	if(!$conn){
		echo "database connection failed";
	}
	$geneSymbols = array();
	
	// USE THE SAME TABLE AS OLD WORKING VERSION!
	$strSql = "SELECT distinct geneSymbol1 FROM t_sentence_hit_gene2gene_Host order by geneSymbol1";
}
catch(Exception $e){
	echo "error";
	print_r($e->getMessage());
}
$rs = $db->Execute($strSql);
foreach($rs as $row) {
	array_push($geneSymbols, $row['geneSymbol1']);
}
$rs->close();
include('../inc/template_top.php');
?>
<table width="100%" border="0" cellpadding="0" cellspacing="0">
	<tr>
		<td width="160" valign="top" style="min-width:160px">
<?php 
include('../inc/template_left.php');
?>
		</td>
		<td valign="top">
		<div style="margin:6px 10px 16px 10px; border-top:2px #4A2F65 solid">
		<h3>BioSummarAI Gene Search</h3>
        
        <p><strong>Select or Enter Gene Symbols:</strong><br>
        <span style="font-size: 0.9em; color: #666;">(Start typing to search the list, or enter new genes separated by commas/spaces)</span></p>
        
        <form action="searchgenes.php" method="POST">
          <table border="0" cellpadding="4">
            <tr>
              <td bgcolor="#E4E4E4" class="styleLeftColumn">Genes: </td>
              <td class="tdData">
              	<select class="genes-multiple" name="genes[]" multiple="multiple" style="width: 400px; min-height: 40px;">
		<?php
		foreach($geneSymbols as $symbol){
		?>
			<option value="<?php echo htmlspecialchars($symbol); ?>"><?php echo htmlspecialchars($symbol); ?></option>
   		<?php } ?>
		</select>
		</td>
              <td align="center" valign="top">
              	<button type="submit" name="search_type" value="intersection" style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 5px; display: block; width: 140px;">🔍 Search Common</button>
              	<button type="submit" name="search_type" value="union" style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; display: block; width: 140px;">📑 Search Related</button>
              </td>
            </tr>
          </table>
        </form>
        
        <p style="font-size: 0.85em; color: #666;">
        <strong>Search Common:</strong> Finds records containing ALL selected genes<br>
        <strong>Search Related:</strong> Finds records containing ANY of the selected genes
        </p>
        
        <p>&nbsp;</p>
		</div>
		</td>
	</tr>
</table>
<script>
$(document).ready(function() {
    $(".genes-multiple").select2({
        placeholder: "Select or type gene symbols...",
        tags: true,
        tokenSeparators: [',', ' ', '\n', '\t'],
        width: '400px'
    });
});
</script>
</body>
<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
var pageTracker = _gat._getTracker("UA-4869243-4");
pageTracker._trackPageview();
</script>
</html>
