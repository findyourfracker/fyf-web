<?php

function run_curl($url)
   {
   $ch = curl_init();
   curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
   curl_setopt($ch,CURLOPT_URL, $url);
   curl_setopt($ch,CURLOPT_HEADER, 0);
   curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
   $rslts = curl_exec($ch);
   curl_close($ch);
   return $rslts;
   }

?>
