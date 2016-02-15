<?php

ini_set('display_startup_errors',1);
ini_set('display_errors',1);
ini_set('error_reporting',E_ALL);
ini_set('error_log','json.cat');
date_default_timezone_set('America/New_York');
$ipaddr = $_SERVER['REMOTE_ADDR'];

$path = getcwd() . '/prjx270/';

$h = fopen(getcwd() . '/json2.out','w');

$d = dir($path);
while (false !== ($entry = $d->read()))
   {
   fputs($h,"\n\n$entry\n\n");
   if (strpos($entry,'.json') === false) continue;
   $x = file_get_contents($path . $entry,'r');
   $y = json_decode($x);
   fputs($h,print_r($y,true));
   }
$d->close();
fclose($h);

?>
