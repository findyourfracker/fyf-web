<?php

ini_set('display_errors',1);
ini_set('error_reporting',E_ALL);
ini_set('error_log','contact.cat');

require($_SERVER['DOCUMENT_ROOT'] . '/includes/key.php');

include 'curl.inc';

date_default_timezone_set('America/New_York');

$ipaddr = $_SERVER['REMOTE_ADDR'];

if (isset($_GET['ps']))
   {
   $x = $_GET['ps'];
   echo $x . '<br><br>';
   list($last,$first,$leg_id,$f4,$f5) = explode(';',$x);
   get_district_s($leg_id);
   }

if (isset($_GET['pf']))
   {
   $x = $_GET['pf'];
   echo $x . '<br><br>';
   list($last,$first,$bioguide_id,$state,$party,$chamber,$district) = explode(';',$x);
   get_district_f($bioguide_id,$state,$chamber,$district);
   }

function get_district_s($leg_id)
   {
   $key = SUNLIGHT_KEY;
   $base = 'http://openstates.org/api/v1/';
   $x = $base . "legislators/$leg_id/?apikey=$key&fields=state,district,chamber";
   $json = run_curl($x);
   $c = json_decode($json);
   if ($c == NULL)
      {
      echo '<div>no district map</div>';
      return;
      }
   $state = $c->state;
   $district = $c->district;
   $chamber = $c->chamber;
   $boundary_id = 'sld' . substr($chamber,0,1) . '/' . $state . '-' . $district;
   $base = 'http://openstates.org/api/v1/districts/boundary/';
   $x = $base . $boundary_id . "/?apikey=$key";
   $json = run_curl($x);
   $c = json_decode($json);
   if ($c == NULL)
      {
      echo '<div>no district map</div>';
      return;
      }
   $center_lon = $c->region->center_lon;
   $center_lat = $c->region->center_lat;
   $lon = array();
   $lat = array();
   $imax = count($c->shape[0][0]);
   for ($i=0; $i<$imax; $i++)
      {
      $lon[] = $c->shape[0][0][$i][0];
      $lat[] = $c->shape[0][0][$i][1];
      }
   $latmax = max($lat);
   $latmin = min($lat);
   $lonmax = max($lon);
   $lonmin = min($lon);
   $h = fopen('district3.tpl','r');
   while (true)
      {
      $x = fgets($h);
      if ($x == '') break;
      if (strpos($x,'[[[lat-and-lon-here]]]') !== false)
         {
         for ($i=0; $i<$imax; $i++)
            {
            echo 'new google.maps.LatLng(' . $lat[$i] . ',' . $lon[$i] . '),' . "\n";
            }
         continue;
         }
      if (strpos($x,'[[[top-left-width-height]]]') !== false)
         {
         $x = str_replace('[[[top-left-width-height]]]','width: 320px; height: 200px;',$x);
         echo $x;
         continue;
         }
      if (strpos($x,'[[[fitbounds here]]]') !== false)
         {
         echo "var nw = new google.maps.LatLng($latmin,$lonmin);\n";
         echo "var se = new google.maps.LatLng($latmax,$lonmax);\n";
         echo "var bounds = new google.maps.LatLngBounds(nw,se);\n";
         echo "map.fitBounds(bounds);";
         continue;
         }
      if (strpos($x,'[[[center-coords-here]]]') !== false)
         {
         $y = $center_lat . ',' . $center_lon;
         echo "var center = new google.maps.LatLng($y);\n";
         echo "map.setCenter(center);\n";
         continue;
         }
      echo $x;
      }
   }

function get_district_f($bioguide_id,$state,$chamber,$district)
   {
   if ($chamber == 'senate') return;
   $y = strtolower($state) . '-' . sprintf('%02d',$district);
   $x = 'http://gis.govtrack.us/boundaries/cd-2012/' . $y . '/simple_shape?format=json';
   $y = run_curl($x);
   $z = json_decode($y);
   $w = $z->coordinates[0][0];
   // echo '<pre>';
   // print_r($w);
   $lon = array();
   $lat = array();
   $imax = count($w);
   for ($i=0; $i<$imax; $i++)
      {
      $lon[] = $w[$i][0];
      $lat[] = $w[$i][1];
      }
   $latmax = max($lat);
   $latmin = min($lat);
   $lonmax = max($lon);
   $lonmin = min($lon);
   $center_lat = $latmin + ($latmax - $latmin) / 2;
   $center_lon = $lonmin + ($lonmax - $lonmin) / 2;
   $h = fopen('district3.tpl','r');
   while (true)
      {
      $x = fgets($h);
      if ($x == '') break;
      if (strpos($x,'[[[lat-and-lon-here]]]') !== false)
         {
         for ($i=0; $i<$imax; $i++)
            {
            echo 'new google.maps.LatLng(' . $lat[$i] . ',' . $lon[$i] . '),' . "\n";
            }
         continue;
         }
      if (strpos($x,'[[[top-left-width-height]]]') !== false)
         {
         $x = str_replace('[[[top-left-width-height]]]','width: 320px; height: 200px;',$x);
         echo $x;
         continue;
         }
      if (strpos($x,'[[[fitbounds here]]]') !== false)
         {
         echo "var nw = new google.maps.LatLng($latmin,$lonmin);\n";
         echo "var se = new google.maps.LatLng($latmax,$lonmax);\n";
         echo "var bounds = new google.maps.LatLngBounds(nw,se);\n";
         echo "map.fitBounds(bounds);";
         continue;
         }
      if (strpos($x,'[[[center-coords-here]]]') !== false)
         {
         $y = $center_lat . ',' . $center_lon;
         echo "var center = new google.maps.LatLng($y);\n";
         echo "map.setCenter(center);\n";
         continue;
         }
      echo $x;
      }
   }

?>
