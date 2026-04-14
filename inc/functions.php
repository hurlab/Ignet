<?php  
#if (array_key_exists('REMOTE_ADDR', $_SERVER)){
#	if ($_SERVER['REMOTE_ADDR']=='141.211.38.150' || $_SERVER['REMOTE_ADDR']=='141.214.17.18') {
#		ini_set("display_errors", "1"); 
#		ini_set("display_startup_errors", "1"); 
#		error_reporting(E_ALL);
#	}
#}
#else {
	ini_set("display_errors", "0");
	ini_set("display_startup_errors", "0");
	error_reporting(E_ERROR | E_PARSE);
#}

// Load database connection credentials
include('../../../conf/config.php');

//For database and content side
$adminEmail = "hurlabshared@gmail.com";
//For programming side
$webmasterEmail = "hurlabshared@gmail.com";
$webmasterName = "Ignet Team";
$webmasterPhone = '';
$systemEmailFlag = '[Ignet]';
$mail_relay_host = '';

include('adodb5/adodb-errorhandler.inc.php');
include('adodb5/adodb.inc.php');

function formatOutput($strIn, $keywords = array()) {
	$strOut = htmlentities($strIn, ENT_COMPAT, 'UTF-8');
	
	$strOut = str_replace("\n",'<br>',$strOut);
	$colors = array('blue','blue','blue','blue','blue','blue','blue','blue','blue','blue');
	$bgcolors = array('yellow','#a0ffff','#99ff99','#ff9999','yellow','yellow','yellow','yellow','yellow','yellow');

	if (!empty($keywords)) {
		for ($i=0; $i<sizeof($keywords); $i++) {
			$strOut = preg_replace('/\b('. $keywords[$i] . ')\b/si',"<span style=\"background-color:" . $bgcolors[$i] . "; color:" . $colors[$i] . "\">$1</span>", $strOut);
		}
	}

	return $strOut;
}

//transform fulltext search keywords
function transformKeywords ($searchTerm) {
	$searchTerm = trim($searchTerm);
	
	$searchTerm = preg_replace('/\s+/',' +', $searchTerm);
	$searchTerm = preg_replace('/\s+\+and\s+\+/i',' +', $searchTerm);
	$searchTerm = preg_replace('/\s+\+or\s+\+/i',' ', $searchTerm);
	$searchTerm = preg_replace('/\++\s*/','+', $searchTerm);
	$searchTerm = preg_replace('/(\w+)\s+\+/i','+$1 +', $searchTerm);
	preg_match_all('/"[^"]+"/', $searchTerm, $matches);
	foreach ($matches[0] as $match) {
		$searchTerm = str_replace($match, str_replace('+','', $match), $searchTerm);
	}
	
	return $searchTerm;
}


function createRandomPassword() {
	$chars = "abcdefghijkmnopqrstuvwxyz023456789";
	$len = strlen($chars) - 1;
	$pass = '';
	for ($i = 0; $i < 8; $i++) {
		$pass .= $chars[random_int(0, $len)];
	}
	return $pass;
}


function formatSqlStr($strIn){
	$strIn = str_replace("'","''", $strIn);
	return $strIn;
}

/**
 * Sanitize a gene symbol: allow only alphanumeric, hyphens, dots, and underscores.
 */
function sanitizeGeneSymbol($sym) {
	return preg_replace('/[^A-Za-z0-9._-]/', '', trim($sym));
}

/**
 * Validate and return an ORDER BY column from a whitelist.
 * Returns the default if the input is not in the allowed list.
 */
function sanitizeOrderBy($input, $allowed, $default = '') {
	return in_array($input, $allowed, true) ? $input : $default;
}

/**
 * Validate sort direction (ASC or DESC only).
 */
function sanitizeOrder($input) {
	$input = strtoupper(trim($input));
	return ($input === 'DESC') ? 'DESC' : 'ASC';
}


function rmEndPeriod ($str) {
	$tmpStr = $str;
	if (notEmptyStr($tmpStr)) {
		if ($tmpStr[strlen($tmpStr)-1] == '.') {
			$tmpStr = substr($tmpStr, 0, strlen($tmpStr)-1);
		}
	}
	return $tmpStr;
}


function notEmptyStr($str) {
	$result = true;
	
	if ($str == NULL) {
		$result = false;
	}elseif (trim($str)=='') {
		$result = false;
	}
	return $result;
}

//updated by benubansal
class Validation{
	var $request;
	var $strErrorMsg = '';


	function __construct($request) {
        	$this->request = $request;
    		}
	//function _construct($request){
	//	$this->request=$request;
	//}
	
	function getInput($strInput, $strCName, $intMin, $intMax, $toTrim = true) {
        $blflag = true;
        $strTmp = $this->request[$strInput] ?? ''; // Use null coalescing operator

        if ($toTrim) {
            $strTmp = trim($strTmp);
        }

        if (strlen($strTmp) > $intMax) {
            $blflag = false;
            $this->strErrorMsg .= "$strCName too long (maximum length: $intMax)<br>";
        }

        if (strlen($strTmp) < $intMin) {
            $blflag = false;
            if ($strTmp == '') {
                $this->strErrorMsg .= "$strCName is required<br>";
            } else {
                $this->strErrorMsg .= "$strCName too short (minimum length: $intMin)<br>";
            }
        }

        return $strTmp;
    }	
/*	function getInput($strInput,$strCName, $intMin, $intMax, $toTrim = true) {
		$blflag=True;
		if (array_key_exists($strInput, $this->request)) {
			$strTmp=$this->request[$strInput]; 
		}
		else {
			$strTmp='';
		}
		
		if ($toTrim) {
			$strTmp=trim($strTmp);
		}


		if (strlen($strTmp)>$intMax) {
			$blflag=False;
			$this->strErrorMsg=$this->strErrorMsg . $strCName . " too long (maximum length: $intMax)<br>" ;
		}
		
		if (strlen($strTmp)<$intMin) {
			if ($strTmp=='') {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " is required<br>" ;
			}
			else {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " too short (minimum length: $intMin)<br>" ;
			}
		}

		return $strTmp;
	}
 */
	function getArray($strInput ,$strCName, $isRequired = true) {
		$blflag=True;
		if (array_key_exists($strInput, $this->request)) {
			$strTmp=$this->request[$strInput]; 
		}
		else {
			$strTmp='';
		}

		if (!is_array($strTmp)){
			$blflag=False;
		}

		if ($blflag==False && $isRequired==True)
			$this->strErrorMsg=$this->strErrorMsg . $strCName . " is required<br>" ;
		return $strTmp;
	}

	function getAccount($strInput,$strCName, $isRequired = true) {
		$intMax=20;
		$intMin=3;
		$blflag=True;
		if (array_key_exists($strInput, $this->request)) {
			$strTmp=$this->request[$strInput]; 
		}
		else {
			$strTmp='';
		}
		$strTmp=trim($strTmp);

		if (strlen($strTmp)>$intMax) {
			$blflag=False;
			$this->strErrorMsg=$this->strErrorMsg . $strCName . " too long (maximum length: $intMax)<br>" ;
		}
		
		if (strlen($strTmp)<$intMin) {
			$blflag=False;
			$this->strErrorMsg=$this->strErrorMsg . $strCName . " too short (minimum length: $intMin)<br>" ;
		}

		$regex = '/^[^ ,\']+$/';
		if (preg_match($regex, $strTmp)) {
			$blflag = true;
		}
		else {
			$blflag = false;
			$this->strErrorMsg=$this->strErrorMsg . $strCName . " contains illegal charactors (Space, comma or apostrophe) <br>" ;
		}

		return $strTmp;
	}

	function getPhone($strInput, $strCName, $isRequired = false) {
		$blflag=True;
		$intMax=20;
		$intMin=5;

		if (array_key_exists($strInput, $this->request)) {
			$strTmp=$this->request[$strInput]; 
		}
		else {
			$strTmp='';
		}
		$strTmp=trim($strTmp);


		$strAllow="0123456789-,.() ";

		if ($isRequired==True || strlen($strTmp)>0 ){
			if (strlen($strTmp)>$intMax) {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " too long (maximum length: $intMax)<br>" ;
			}
			
			if (strlen($strTmp)<$intMin) {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " too short (minimum length: $intMin)<br>" ;
			}
	
			$regex = '/^[\d -_,\(\)\.]+$/';
			if (preg_match($regex, $strTmp)) {
				$blflag = true;
			}
			else {
				$blflag = false;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " contains illegal charactors (allowed charactors are: \"0123456789 -,.()\") <br>" ;
			}
		}

		return $strTmp;
	}

	function getEmail($strInput,$strCName,$isRequired = true) {
		$blflag=True;
		$intMax=50;
		$intMin=5;
		if (array_key_exists($strInput, $this->request)) {
			$strTmp=$this->request[$strInput]; 
		}
		else {
			$strTmp='';
		}
		$strTmp=trim($strTmp);

		if ($isRequired==True || strlen($strTmp)>0 ){
			if (strlen($strTmp)>$intMax) {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " too long (maximum length: $intMax)<br>" ;
			}
			
			if (strlen($strTmp)<$intMin) {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " too short (minimum length: $intMin)<br>" ;
			}
	
			//$regex = '/^[\d-_\w\.@]{5,10}$/';
			$regex = '&^(?:                                               # recipient:
         ("\s*(?:[^"\f\n\r\t\v\b\s]+\s*)+")|                          #1 quoted name
         ([-\w!\#\$%\&\'*+~/^`|{}]+(?:\.[-\w!\#\$%\&\'*+~/^`|{}]+)*)) #2 OR dot-atom
         @(((\[)?                     #3 domain, 4 as IPv4, 5 optionally bracketed
         (?:(?:(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:[0-1]?[0-9]?[0-9]))\.){3}
               (?:(?:25[0-5])|(?:2[0-4][0-9])|(?:[0-1]?[0-9]?[0-9]))))(?(5)\])|
         ((?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)*[a-z](?:[-a-z0-9]*[a-z0-9])?))  #6 domain as hostname
         $&xi';
			if (preg_match($regex, $strTmp)) {
				$blflag = true;
			}
			else {
				$blflag = false;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " does not look like an real eamil address<br>" ;
			}
		}

		return $strTmp;
	}

	function getZipCode($strInput, $strCName, $isRequired = false) {
		$blflag=True;
		$intMax=10;
		$intMin=5;
		if (array_key_exists($strInput, $this->request)) {
			$strTmp=$this->request[$strInput]; 
		}
		else {
			$strTmp='';
		}
		$strTmp=trim($strTmp);

		if ($isRequired==True || strlen($strTmp)>0 )	{
			if (strlen($strTmp)>$intMax) {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " too long (maximum length: $intMax)<br>" ;
			}
			
			if (strlen($strTmp)<$intMin) {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " too short (minimum length: $intMin)<br>" ;
			}

			if (preg_match('/^[\w-]+$/', $strTmp)) {
				$blflag = true;
			}
			else {
				$blflag = false;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " contains illegal charactors (allowed charactors are: \"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-\") <br>" ;
			}
		}

		if ($blflag==False)
			$this->strErrorMsg=$this->strErrorMsg . $strCName . "<br>" ;
		return $strTmp;
	}

	function getNumber($strInput, $strCName, $intMin, $intMax, $isRequired = false) {
		$blflag=True;
		if (array_key_exists($strInput, $this->request)) {
			$strTmp=$this->request[$strInput]; 
		}
		else {
			$strTmp='';
		}
		$strTmp=trim($strTmp);
		
		if ($isRequired==True || strlen($strTmp)>0 )	{
			if (strlen($strTmp)>$intMax) {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " too long (maximum length: $intMax)<br>" ;
			}
			elseif (strlen($strTmp)<$intMin) {
				$blflag=False;
				$this->strErrorMsg=$this->strErrorMsg . $strCName . " too short (minimum length: $intMin)<br>" ;
			}
			else {
				$strReg = '/^[\d-\.]+$/';
				if (!preg_match($strReg, $strTmp)) {
					$blflag = false;
					$this->strErrorMsg=$this->strErrorMsg . $strCName . " contains illegal charactors<br>" ;
				}
			}
		}

		return $strTmp;
	}
  
	function concatError($strError) {
		$this->strErrorMsg .= $strError . "<br>" ;
	}
  
	function getErrorMsg(){
		return $this->strErrorMsg;
	}
}

function returnSubstrings($text, $openingMarker, $closingMarker) {
	$openingMarkerLength = strlen($openingMarker);
	$closingMarkerLength = strlen($closingMarker);
	
	$result = array();
	$position = 0;
	while (($position = strpos($text, $openingMarker, $position)) !== false) {
		$position += $openingMarkerLength;
		if (($closingMarkerPosition = strpos($text, $closingMarker, $position)) !== false) {
			$result[] = substr($text, $position, $closingMarkerPosition - $position);
			$position = $closingMarkerPosition + $closingMarkerLength;
		}
	}
	return $result;
}


function parse_json_query($str_json){
	$json = json_decode($str_json, true);
	$results = array();
	if (isset($json['results']['bindings'])){
		foreach ($json['results']['bindings'] as $binding) {
			$result = array();
			foreach ($binding as $key=>$value) {
				$result[$key] = $value['value'];
			}
			$results[] = $result;
		}
	}

	return($results);
}



//Use curl to do a post request
function curl_post_contents($url, $fields) {
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



function json_query($querystring, $endpoint='http://sparql.hegroup.org/sparql'){
	$fields = array();
	$fields['default-graph-uri'] = '';
	$fields['format'] = 'application/sparql-results+json';
	$fields['debug'] = 'on';
	$fields['query'] = $querystring;
	
	$json = curl_post_contents($endpoint, $fields);
	return(parse_json_query($json));
}
?>

