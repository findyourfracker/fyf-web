
<head>
<link rel="stylesheet" href="https://code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css">
<script src="https://code.jquery.com/jquery-1.10.2.js"></script>
<script src="https://code.jquery.com/ui/1.11.2/jquery-ui.js"></script>
</head>

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
   get_contact_s($leg_id);
   }

if (isset($_GET['pf']))
   {
   $x = $_GET['pf'];
   echo $x . '<br><br>';
   list($last,$first,$bioguide_id,$state,$party,$chamber,$district) = explode(';',$x);
   get_contact_f($bioguide_id);
   }

function get_contact_s($leg_id)
   {
   $key = SUNLIGHT_KEY;
   $base = 'http://openstates.org/api/v1/';
   $x = $base . "legislators/$leg_id/?apikey=$key";
   $json = run_curl($x);
   $c = json_decode($json);
   if ($c == NULL)
      {
      echo '<div>no contact info</div>';
      return;
      }
   // echo '<pre>';
   // print_r($c);
   echo '<table>';
   foreach ($c as $k => $v)
      {
      echo '<tr>';
      if (gettype($v) == 'object')
         {
         echo "<td>$k</td><td>object omitted</td>";
         continue;
         }
      if (gettype($v) == 'array')
         {
         if ($k == 'offices')
            {
            $imax = count($v);
            for ($i=0; $i<$imax; $i++)
               {
               echo "<td>office</td><td>$i</td>";
               foreach ($v[$i] as $kk => $vv)
                  {
                  echo '<tr>';
                  echo "<td>$kk</td><td>$vv</td>";
                  echo '</tr>';
                  }
               }
            }
         else
            {
            echo "<td>$k</td><td>array omitted</td>";
            continue;
            }
         continue;
         }
      echo "<td>$k</td><td>$v</td>";
      echo '</tr>';
      }
   echo '</table>';
   }

function get_contact_f($bioguide_id)
   {
   $key = SUNLIGHT_KEY;
   $base = 'https://congress.api.sunlightfoundation.com';
   $x = $base . "/legislators?apikey=$key&bioguide_id=$bioguide_id";
   $json = run_curl($x);
   $c = json_decode($json);
   echo '<table>';
   $imax = $c->count;
   for ($i=0; $i<$imax; $i++)
      {
      foreach ($c->results[$i] as $k => $v)
         {
         echo '<tr>';
         if (gettype($v) == 'array')
            {
            echo "<td>$k</td><td>omitted</td>";
            continue;
            }
         echo "<td>$k</td><td>$v</td>";
         echo '</tr>';
         }
      }
   echo '</table>';
   }

?>

<script>
$("tr:even").css("background-color","#dddddd");
$("tr:odd").css("background-color","#eeeeee");
</script>

