<?php

ini_set('display_errors',1);
ini_set('error_reporting',E_ALL);
ini_set('error_log','votes.cat');

require($_SERVER['DOCUMENT_ROOT'] . '/includes/key.php');

include 'curl.inc';

date_default_timezone_set('America/New_York');

$ipaddr = $_SERVER['REMOTE_ADDR'];

if (isset($_GET['ps']))
   {
   $x = $_GET['ps'];
   list($f1,$f2,$f3,$f4) = explode(';',$x);
   $state_of_leg = substr($f3,0,2);
   }

if (isset($_GET['ps']))
   {
   ps($_GET['ps']);
   }

if (isset($_GET['pf']))
   {
   pf($_GET['pf']);
   }

// state

function ps($x)
   {
   global $state_of_leg, $ipaddr;
   $x = $_GET['ps'];
   echo $x . '<br><br>';
   list($last,$first,$leg_id,$party,$chamber,$district) = explode(';',$x);
   $h = fopen('bills-state.txt','r');
   $flag = 0;
   while (true)
      {
      $x = fgets($h);
      if ($x == '') break;
      list($bill_id,$session,$state_of_bill,$side) = explode(';',$x);
      if ($state_of_bill !== $state_of_leg) continue;
      get_vote_ps($bill_id,$session,$state_of_bill,$leg_id,$side);
      $flag = 1;
      }
   fclose($h);
   if ($flag == 0) echo 'no voting record';
   }

function get_vote_ps($bill_id,$session,$state_of_bill,$leg_id,$side)
   {
   $score = 0;
   echo "<b>$bill_id $session $state_of_bill</b><br>";
   $key = SUNLIGHT_KEY;
   $base = 'http://openstates.org/api/v1/';
   $bill_id_1 = str_replace(' ','%20',$bill_id);
   $x = $base . "/bills/$state_of_bill/$session/$bill_id_1/?apikey=$key&fields=votes";
   $json = run_curl($x);
   $c = json_decode($json);
   // loop over votes
   $jmax = count($c->votes);
   for ($j=0; $j<$jmax; $j++)
      {
      $imax = $c->votes[$j]->yes_count;
      for ($i=0;$i<$imax;$i++)
         {
         $x = $c->votes[$j]->yes_votes[$i]->leg_id;
         if ($x == $leg_id)
            {
            echo ' [' . $c->votes[$j]->date . '] ';
            echo ' [' . $c->votes[$j]->motion . '] ';
            echo ' yes ';
            $score++;
            echo '<br>';
            }
         }
      $imax = $c->votes[$j]->no_count;
      for ($i=0;$i<$imax;$i++)
         {
         $x = $c->votes[$j]->no_votes[$i]->leg_id;
         if ($x == $leg_id)
            {
            echo ' [' . $c->votes[$j]->date . '] ';
            echo ' [' . $c->votes[$j]->motion . '] ';
            echo ' no ';
            $score--;
            echo '<br>';
            }
         }
      $imax = $c->votes[$j]->other_count;
      for ($i=0;$i<$imax;$i++)
         {
         $x = $c->votes[$j]->other_votes[$i]->leg_id;
         if ($x == $leg_id)
            {
            echo ' [' . $c->votes[$j]->date . '] ';
            echo ' [' . $c->votes[$j]->motion . '] ';
            echo ' other ';
            echo '<br>';
            }
         }
      }
   echo $side * $score . '<br>';
   }

// federal

function pf($x)
   {
   global $state_of_leg, $ipaddr;
   $x = $_GET['pf'];
   echo $x . '<br><br>';
   list($last,$first,$bioguide_id,$party,$chamber) = explode(';',$x);
   $h = fopen('bills-federal.txt','r');
   $flag = 0;
   while (true)
      {
      $x = fgets($h);
      if ($x == '') break;
      list($bill_id,$side) = explode(';',$x);
      get_vote_pf($bill_id,$bioguide_id,$side);
      $flag = 1;
      }
   fclose($h);
   if ($flag == 0) echo 'no voting record';
   }

function get_vote_pf($bill_id,$bioguide_id,$side)
   {
   $score = 0;
   echo "<b>$bill_id</b><br>";
   $key = SUNLIGHT_KEY;
   $base = 'https://congress.api.sunlightfoundation.com';
   $x = $base . "/votes?apikey=$key&bill_id=$bill_id&fields=bill_id,voter_ids,vote_type,voted_at";
   $json = run_curl($x);
   $c = json_decode($json);
   $imax = count($c->results);
   for ($i=0; $i<$imax; $i++)
      {
      $x = $c->results[$i]->voter_ids;
      foreach ($x as $k => $v)
         {
         if ($k == $bioguide_id)
            {
            echo ' [' . $c->results[$i]->voted_at . '] ';
            echo ' [' . $c->results[$i]->vote_type . '] ';
            echo $v . ' ';
            if ($v == 'Yea') $score++;
            if ($v == 'Nay') $score--;
            echo '<br>';
            }
         }
      }
   echo $side * $score . '<br>';
   }

?>
