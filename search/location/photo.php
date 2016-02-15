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
   get_photo_s($leg_id);
   }

if (isset($_GET['pf']))
   {
   $x = $_GET['pf'];
   echo $x . '<br><br>';
   list($last,$first,$bioguide_id,$state,$party,$chamber,$district) = explode(';',$x);
   get_photo_f($bioguide_id);
   }

function get_photo_s($leg_id)
   {
   $key = SUNLIGHT_KEY;
   $base = 'http://openstates.org/api/v1/';
   $x = $base . "legislators/$leg_id/?apikey=$key&fields=photo_url";
   $json = run_curl($x);
   $c = json_decode($json);
   if ($c == NULL)
      {
      echo '<div>no image</div>';
      return;
      }
   $y = $c->photo_url;
   echo "<img src=$y height=200px>";
   }

function get_photo_f($bioguide_id)
   {
   $h = fopen('bio2gov.txt','r');
   while (true)
      {
      $x = fgets($h);
      if ($x == '') break;
      list($bio,$gov) = explode(';',$x);
      $gov = substr($gov,0,-2);
      if ($bio == $bioguide_id)
         {
         $y = 'https://www.govtrack.us/data/photos/' . $gov . '-200px.jpeg';
         echo "<img src=$y height=200px>";
         return;
         }
      }
   error_log('no image for ' . $bio . ' ' . $gov);
   echo '<div>image not available</div>';
   }

?>
