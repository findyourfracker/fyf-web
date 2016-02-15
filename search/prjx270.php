<?PHP

require($_SERVER['DOCUMENT_ROOT'] . '/includes/key.php');

// ini_set('display_startup_errors',1);
// ini_set('display_errors',1);
// ini_set('error_reporting',E_ALL);
// ini_set('error_log','prjx270.cat');
// date_default_timezone_set('America/New_York');

// error_log('ned test prjx270.php');
// error_log(print_r($_POST,true));
// error_log(print_r($_GET,true));
// error_log(print_r($_SERVER,true));

//----------GATEKEEPER
$ENG.="SQL Arrived...<br>\n";
$ENG.= "Create vars from Get, Post...<br>\n";
//parse_str($_SERVER['QUERY_STRING']);
foreach($_POST AS $postkey => $postvalue){
	//$ENG.="$postkey: $postvalue\n";
	$$postkey=$postvalue;
}
$ENG .= "Gatekeeper...<br>\n";
$Gate="Closed";	
$ValidSites = array("www.findyourfracker.org","findyourfracker.org","dev2.findyourfracker.org","dev3.findyourfracker.org","localhost");
$AccessSets = array("tp","tp","tp","localhost");

if(false){
	$Gate="Open";
	$http_referer_intrnl="http://".$_SERVER["HTTP_HOST"];
}else{
	$http_referer_intrnl=$_SERVER['HTTP_REFERER'];
}
$ENG.="http_referer_intrnl: $http_referer_intrnl... <br>\n";

foreach($ValidSites as $key => $val){
	$site_v1="http://".$val;
	$site_v2="http://www.".$val;
	$strpos_v1=strpos($http_referer_intrnl,$site_v1);
	$strpos_v2=strpos($http_referer_intrnl,$site_v2);
	$ENG .= $key.":".$val.":".$strpos_v1.":".$strpos_v2."<br>\n";
	if($strpos_v1===0 or $strpos_v2===0){
		$Gate="Open";
		$AccessSetActive=$AccessSets[$key];
		$ENG.="zing: $key - $val <br>\n";
		$ENG.="zing2: $AccessSetActive <br>\n";
	}
}
$ENG .= "Gate $Gate...<br>\n";
if($Gate=="Open"){
	$ENG.="AccessSet: ".$AccessSetActive."...<br>\n";
	if($AccessSetActive=="tp"){
		$sql_host="localhost";
		$sql_uid="tbd";
		$sql_pwd="tbd";
		$sql_database="tbd";
	}else if($AccessSetActive=="localhost"){
		$sql_host="localhost";
		$sql_uid="root";
		$sql_pwd="";
		if(pathinfo($_SERVER['HTTP_REFERER'],PATHINFO_FILENAME)=="prjx270" || $fmp=="tbd"){
			$sql_database="tbd";
		}
	}
	$ENG.="More info: ".pathinfo($_SERVER['HTTP_REFERER'],PATHINFO_FILENAME)."<br>\n";
	$ENG.="Host/DB: ".$sql_host."/".$sql_database."<br>\n";
} else {
	$sql_host="";
	$sql_uid="";
	$sql_pwd="";
	$sql_database="";
	$ENG .= "Unauthorized acesss...<br>\n";
	echo "Unauthorized access...<br>";//&ENG=$ENG";
	exit;
}


//----------FUNCTIONS
function sqlEscapes($str){
	//urlencode($str);
	$str=str_replace("&","%26",$str);
	$str=str_replace("'","%27",$str);
	return $str;
}
function sqlUnescapes($str){
	//$str=urldecode($str);
	//$str=str_replace("%27","'",$str);
	return $str;
}

function sqlAppendVars($VarArr){
	$ReturnVar="";
	while(list($key,$value)=each($VarArr)){//foreach($VarArr as $key=>$value){
		$ReturnVar.=($ReturnVar!="" ? ", " : "").$value."='".sqlEscapes($GLOBALS[$value])."'";
	}
	return $ReturnVar;
}

function sqlquery_appendquerystring($exclusions){
	$returnstr="";
	$queryarr=explode("&",$_SERVER['QUERY_STRING']);
	$varlist=array();
	foreach($queryarr AS $varpos => $varpair){
		$varlist[$varpos]=explode("=",$varpair);
		$varname=$varlist[$varpos][0];
		$varval=$varlist[$varpos][1];
		$DoAppend="yes";
		foreach($exclusions AS $exkey => $exvar){
			if($exvar==$varname){
				$DoAppend="no";
			}
		}
		if($DoAppend=="yes"){
			$returnstr .= ($returnstr!="" ? ", " : " ") . "$varname='$varval'";
		}
	}
	return $returnstr;
}

function RunCurl($url){
	$ch=curl_init();
	curl_setopt($ch,CURLOPT_URL,$url);
	curl_setopt($ch,CURLOPT_HEADER,0);
	curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
	$rslts=curl_exec($ch);
	curl_close($ch);
	return $rslts;
}

//----------OPTIONS
if($Action=="SunlightGetBoundary"){
	//$url="http://openstates.org/api/v1/districts/boundary/".$BoundaryId."/?apikey=".SUNLIGHT_KEY;
	//RunCurl($url);
	//No return yet

}else if($Action=="SecurityTest"){
	echo $SendVar;
		
}else if($Action=="ZipFromLatLng"){
	$url="http://maps.googleapis.com/maps/api/geocode/json?latlng=".urlencode($Lat).",".urlencode($Lng)."&sensor=false";
	$rslts=RunCurl($url);
	if($rslts===FALSE){
    	echo curl_error($ch);
    }else{
		echo $rslts;
	}

}else if($Action=="GetLegislatorsFromLatLng"){
	$RsltsState=RunCurl("http://openstates.org/api/v1/legislators/geo/?apikey=".SUNLIGHT_KEY."&lat=".urlencode($Lat)."&long=".urlencode($Lng));
	$RsltsFederal=RunCurl("https://congress.api.sunlightfoundation.com/legislators/locate?apikey=".SUNLIGHT_KEY."&latitude=".urlencode($Lat)."&longitude=".urlencode($Lng));
	echo "[".$RsltsState.",".$RsltsFederal."]";

}else if($Action=="Login"){
	if($Pwd=="dev"){
		echo "success";
	}else{
		echo "fail";
	}
	
}else{
	echo "NoneSuch: ".$Action;
}
?>
