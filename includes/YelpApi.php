<?php

/**
 * Yelp API v2.0 code sample.
 *
 * This program demonstrates the capability of the Yelp API version 2.0
 * by using the Search API to query for businesses by a search term and location,
 * and the Business API to query additional information about the top result
 * from the search query.
 * 
 * Please refer to http://www.yelp.com/developers/documentation for the API documentation.
 * 
 * This program requires a PHP OAuth2 library, which is included in this branch and can be
 * found here:
 *      http://oauth.googlecode.com/svn/code/php/
 * 
 * Sample usage of the program:
 * `php sample.php --term="bars" --location="San Francisco, CA"`
 */

// Enter the path that the oauth library is in relation to the php file
require_once('OAuth.php');

// Set your OAuth credentials here  
// These credentials can be obtained from the 'Manage API Access' page in the
// developers documentation (http://www.yelp.com/developers)
$CONSUMER_KEY = 'gRRJAGvD01BXyeZkXt9kUw';
$CONSUMER_SECRET = 'RqcoTBNLQaRAbV1bPtFqS_vdWA8';
$TOKEN = 'JbLZZ9MPRsM7tlv6WXwVex6KfU1t9p8z';
$TOKEN_SECRET = '8fasPNOG1EXM8dNQQx5n96VHVqk';
$API_HOST = 'api.yelp.com';
$DEFAULT_TERM = 'Restaurants';
$DEFAULT_LATITUDE = 34.12765000;
$DEFAULT_LONGITUDE = -118.05440100;
$SEARCH_LIMIT = 10;
$SEARCH_PATH = '/v2/search/';
$BUSINESS_PATH = '/v2/business/';


/** 
 * Makes a request to the Yelp API and returns the response
 * 
 * @param    $host    The domain host of the API 
 * @param    $path    The path of the APi after the domain
 * @return   The JSON response from the request      
 */
function request($host, $path) {
    $unsigned_url = "http://" . $host . $path;

    // Token object built using the OAuth library
    $token = new OAuthToken($GLOBALS['TOKEN'], $GLOBALS['TOKEN_SECRET']);

    // Consumer object built using the OAuth library
    $consumer = new OAuthConsumer($GLOBALS['CONSUMER_KEY'], $GLOBALS['CONSUMER_SECRET']);

    // Yelp uses HMAC SHA1 encoding
    $signature_method = new OAuthSignatureMethod_HMAC_SHA1();

    $oauthrequest = OAuthRequest::from_consumer_and_token(
        $consumer, 
        $token, 
        'GET', 
        $unsigned_url
    );
    
    // Sign the request
    $oauthrequest->sign_request($signature_method, $consumer, $token);
    
    // Get the signed URL
    $signed_url = $oauthrequest->to_url();
    // Send Yelp API Call
    $ch = curl_init($signed_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, 0);
	
	
    $data = curl_exec($ch);

    curl_close($ch);
//    echo $data;
//	echo '..................no data';
    return $data;
}

/**
 * Query the Search API by a search term and location 
 * 
 * @param    $term        The search term passed to the API 
 * @param    $location    The search location passed to the API 
 * @return   The JSON response from the request 
 */
function search($term, $latitude, $longitude) {
    $url_params = array();
    
    $url_params['term'] = $term ?: $GLOBALS['DEFAULT_TERM'];
//    $url_params['latitude'] = $latitude?: $GLOBALS['DEFAULT_LATITUDE'];
//    $url_params['longitude'] = $longitude?: $GLOBALS['DEFAULT_LONGITUDE'];
    $url_params['ll'] = $latitude . ',' . $longitude . ',-9.9';
    $url_params['limit'] = $GLOBALS['SEARCH_LIMIT'];
    $search_path = $GLOBALS['SEARCH_PATH'] . "?" . http_build_query($url_params);
//    echo $search_path;
    return request($GLOBALS['API_HOST'], $search_path);
}

/**
 * Query the Business API by business_id
 * 
 * @param    $business_id    The ID of the business to query
 * @return   The JSON response from the request 
 */
function get_business($business_id) {
    $business_path = $GLOBALS['BUSINESS_PATH'] . $business_id;
    
    return request($GLOBALS['API_HOST'], $business_path);
}

/**
 * Queries the API by the input values from the user 
 * 
 * @param    $term        The search term to query
 * @param    $location    The location of the business to query
 */
function query_api($term, $latitude, $longitude) {     
	$BizID=array();
    $response = json_decode(search($term, $latitude, $longitude));
    //print sprintf(
    //    "\n\n%d businesses found\n\n",         
    //   count($response->businesses)
    //);
    if (!(empty($response->businesses))) {
	for ($x = 0; $x < count($response->businesses); $x++) {
    //print sprintf("The number is:%s ", $x) ;

		$business_id = $response->businesses[$x]->id;   
		$BizID[$x] = $response->businesses[$x]->id;
	//print sprintf(
	//		"%d businesses found, querying business info for the top result \"%s\"\n\n",         
	//		count($response->businesses),
	//		$business_id
	//	);

		//$responseB = get_business($business_id);
		
		//print sprintf("Result for business \"%s\" found:\n", $business_id);
		//print "$responseB\n";
	};
    };        
	return $BizID;
}

/**
 * User input is handled here 
 */
/*
 $longopts  = array(
    "term::",
    "latitude::",
    "longitude::",
);
    
$options = getopt("", $longopts);

$term = 'Chinese';
$latitude = 37.96361923;
$longitude = -121.99050140;

query_api($term, $latitude, $longitude);
*/
?>
