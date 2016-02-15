<?php

ini_set('display_errors',1);
ini_set('error_reporting',E_ALL);
ini_set('error_log','json.cat');
date_default_timezone_set('America/New_York');
@$ipaddr = $_SERVER['REMOTE_ADDR'];

$path = getcwd() . '/prjx270/';

$d = dir($path);
while (false !== ($entry = $d->read()))
   {
   echo $entry.'<br>';
   if (strpos($entry,'.json') === false) continue;
   $h = fopen($path . $entry,'r');
   while (true)
      {
      $x = fgets($h);
      if ($x == '') break;
      echo $x . '<br>';
      }
   }
$d->close();

?>
