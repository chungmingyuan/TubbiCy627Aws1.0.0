<?php
include('../includes/config.php');
//no echo or var_dump here???
$postdata = json_decode(file_get_contents("php://input"));

$query="select * from pre_store";

//$query="call get_store_detail('$asr_results','$lat_local','$long_local','$language_local')";

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
//var_dump($postdata);
//var_dump($asr_results);
//var_dump($lat_local);
//var_dump($long_local);
//var_dump($language_local);
?>
