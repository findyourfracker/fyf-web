<?php

ini_set('display_errors',1);
ini_set('error_reporting',E_ALL);
ini_set('error_log','location.cat');

require($_SERVER['DOCUMENT_ROOT'] . '/includes/key.php');

include 'curl.inc';

date_default_timezone_set('America/New_York');

$location = $_GET['location'];

$a = lookup($location);

if ($a == NULL)
   {
   $lat = '37.09';
   $lng = '-95.71';
   }
else
   {
   $lat = $a['lat'];
   $lng = $a['lng'];
   }

echo '<label>' . $lat . ',' . $lng . '</label><br>';

$key = SUNLIGHT_KEY;

$base = "http://openstates.org/api/v1/legislators/geo/";
$url = $base . "?apikey=$key&lat=$lat&long=$lng";
$json = run_curl($url);
$a = json_decode($json);
if ($a == NULL)
   {
   $a = array();
   }

$t = array();

echo '<h2>State</h2>';
foreach ($a as $k => $v)
   {
   $t[] =
      $a[$k]->last_name . ';' .
      $a[$k]->first_name . ';' .
      $a[$k]->leg_id . ';' .
      $a[$k]->state . ';' .
      $a[$k]->party . ';' .
      $a[$k]->chamber . ';' .
      $a[$k]->district
      ;
   }

sort($t);

echo '<div class=accordion>';
foreach ($t as $k => $v)
   {
   $xx = urlencode($v);
   echo fmt1($v);
   echo '<p>';
   echo "<button onclick=\"window.open('photo.php?ps=$xx','_blank','width=500px,height=500px,scrollbars=yes')\">Photo</button>";
   echo "<button onclick=\"window.open('map.php?ps=$xx','_blank','width=500px,height=500px,scrollbars=yes')\">Map</button>";
   echo "<button onclick=\"window.open('contact.php?ps=$xx','_blank','width=500px,height=500px,scrollbars=yes')\">Contact</button>";
   echo "<button onclick=\"window.open('votes.php?ps=$xx','_blank','width=500px,height=500px,scrollbars=yes')\">Votes</button>";
   echo fmt2($v);
   echo '</p>';
   }
// echo '<p>total ' . count($t);
echo '</div>';

$base = 'http://congress.api.sunlightfoundation.com';
$url = $base . "/legislators/locate?apikey=$key&latitude=$lat&longitude=$lng";
$json = run_curl($url);
$b= json_decode($json);
if ($b == NULL)
   {
   $b = array();
   }

$t = array();

echo '<h2>Federal</h2>';
foreach ($b->results as $k =>$v)
   {
   $t[] =
      $b->results[$k]->last_name . ';' .
      $b->results[$k]->first_name . ';' .
      $b->results[$k]->bioguide_id . ';' .
      $b->results[$k]->state . ';' .
      $b->results[$k]->party . ';' .
      $b->results[$k]->chamber . ';' .
      $b->results[$k]->district
      ;
  }

sort($t);

echo '<div class=accordion>';
foreach ($t as $k => $v)
   {
   $xx = urlencode($v);
   echo fmt1($v);
   echo '<p>';
   echo "<button onclick=\"window.open('photo.php?pf=$xx','_blank','width=500px,height=500px,scrollbars=yes')\">Photo</button>";
   echo "<button onclick=\"window.open('map.php?pf=$xx','_blank','width=500px,height=500px,scrollbars=yes')\">Map</button>";
   echo "<button onclick=\"window.open('contact.php?pf=$xx','_blank','width=500px,height=500px,scrollbars=yes')\">Contact</button>";
   echo "<button onclick=\"window.open('votes.php?pf=$xx','_blank','width=500px,height=500px,scrollbars=yes')\">Votes</button>";
   echo fmt2($v);
   echo '</p>';
   }
// echo '<p>total ' . count($t);
echo '</div>';

function lookup($string) {

   $string = str_replace (' ','+',urlencode($string));
   $x = "http://maps.googleapis.com/maps/api/geocode/json?address=".$string."&sensor=false";
   $y = run_curl($x);
   $response = json_decode($y);
   // echo '<pre>';
   // print_r($response->results[0]->geometry);
   $geometry = $response->results[0]->geometry;

   $longitude = $geometry->location->lng;
   $latitude = $geometry->location->lat;

   $array = array(
      'lat' => $latitude,
      'lng' => $longitude
   );

   return $array;

}

function fmt1($v)
   {
   list($f1,$f2,$f3,$f4,$f5,$f6,$f7) = explode(';',$v);
   $color = 'green';
   if (substr($f5,0,1) == 'R') $color = 'red';
   if (substr($f5,0,1) == 'D') $color = 'blue';
   return "<h3><font color=$color>$f1, $f2</font></h3>";
   }

function fmt2($v)
   {
   list($f1,$f2,$f3,$f4,$f5,$f6,$f7) = explode(';',$v);
   return "<br><br>$f3<br>$f4<br>$f5<br>$f6<br>$f7";
   }

?>

<script>
$('.accordion').accordion({collapsible: true, active: false});
</script>

