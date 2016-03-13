<?php
include('../includes/config.php');
include('../includes/OAuth.php');
include('../includes/YelpApi.php');
//no echo or var_dump here???
$postdata = json_decode(file_get_contents("php://input"));
//$inSID  = ($postdata->inSID);
$inAddedBy  = ($postdata->inAddedBy);
$inAddedDate  = date_create()->format('Y-m-d H:i:s');//($postdata->inAddedDate);
$inBizID  = ($postdata->inBizID);
$inCategory = ($postdata->inCategory);
$inCh_Name  = ($postdata->inCh_Name);
$inCity  = ($postdata->inCity);
$inComments  = ($postdata->inComments);
$inLatitude  = ($postdata->inLat);
$inLocation  = ($postdata->inLocation);
$inLongitude  = ($postdata->inLng);
$inModifiedBy  = ($postdata->inModifiedBy);
$inModifiedDate  = date_create()->format('Y-m-d H:i:s');
$inName  = ($postdata->inName);
$inSearch_Icon  = ($postdata->inSearch_Icon);
$inRating  = ($postdata->inRating);
$inRetMsg = ($postdata->inRetMsg);
$inState = ($postdata->inState);
$inLanguage = ($postdata->inLanguage);

// get Yelp bizID
$term = 'Chinese';
$YelpBizIDs=query_api($term, $inLatitude, $inLongitude);
//$inName ='New Lims';
$inName1=array();
$inName1=explode(' ',strtolower($inName . ' '),-1);
$inName3=$inName1[0] . '-' . ((count($inName1) > 1) ? $inName1[1] : '') . ((count($inName1) > 1) ? '-' : '') ;
//var_dump($inName1);
//var_dump($YelpBizIDs);
//var_dump($inName3);

for ($x = 0; $x < count($YelpBizIDs); $x++) {
	if (stristr($YelpBizIDs[$x],$inName3)) {
		$inBizID = $YelpBizIDs[$x];
		$inModifiedBy ='Reviewed';
//		var_dump($inBizID);
//		var_dump($inModifiedBy);
		break;
	};
};

//
$query="call add_store11(";
$query .= "'$inAddedBy'";
$query .= ",'$inAddedDate'";	
$query .= ",'$inBizID'";
$query .= ",'$inCategory'";
$query .= ",'$inCh_Name'";
$query .= ",'$inCity'";
$query .= ",'$inComments'";
$query .= ",'$inLatitude'";
$query .= ",'$inLocation'";
$query .= ",'$inLongitude'";
$query .= ",'$inModifiedBy'";
$query .= ",'$inModifiedDate'";
$query .= ",'$inName'";
$query .= ",'$inRating'";
$query .= ",'$inRetMsg'";
$query .= ",'$inSearch_Icon'";
$query .= ",'$inState'";
$query .= ",'$inLanguage'";
$query .= ")";
//var_dump($inAddedBy);
//var_dump("$inAddedDate",$inAddedDate);	
//var_dump($inBizID);
//var_dump($inCategory);
//var_dump($inCh_Name);
//var_dump($inCity);
//var_dump($inComments);
//var_dump($inLatitude);
//var_dump($inLocation);
//var_dump($inLongitude);
//var_dump($inModifiedBy);
//var_dump($inModifiedDate);
//var_dump($inName);
//var_dump($inRating);
//var_dump($inRetMsg);
//var_dump($inSearch_Icon);
//var_dump($inState);
//var_dump($inLanguage);
//
//var_dump($query);
$result = $mysqli->query($query) or die($mysqli->error.__LINE__);

$arr = array();
if($result->num_rows > 0) {
	while($row = $result->fetch_assoc()) {
		$arr[] = $row;	
	}
}
# JSON-encode the response
$json_response = json_encode($arr);
// # Return the response
echo $json_response;
//-- after debug commentout the var_dump
//var_dump($json_response);
//var_dump($postdata);
//var_dump($asr_results);
//var_dump($lat_local);
//var_dump($inName);
//var_dump($result);
//var_dump($result->num_rows);
//var_dump($mysqli->error.__LINE__);
//var_dump($retMsg);
?>
