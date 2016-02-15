<?php

ini_set('display_startup_errors',1);
ini_set('display_errors',1);
ini_set('error_reporting',E_ALL);
ini_set('error_log','ned.cat');
date_default_timezone_set('America/New_York');

include '../includes/header.php';

if (isset($_POST['address']))
   {
   $address = clean($_POST['address']);
   }
else
   {
   $address = '';
   }

?>

	<div id="searcharea" class="container-fluid">
		<div class="addressbar row">
			<h3>Enter Address or Click on the Map</h3>
			<input value="" name="address" class="email" id="address" placeholder="enter zip code, full address, or legislator last name">
			<input type="submit" value="" name="find" id="address-submit">
<!--			<p>Entering your full address gives the most accurate results.</p>   -->
			<p>We never store your information. <a href="<?php echo $baseurl; ?>/privacy/">Learn more</a>.</p>
		</div>
		<div class="legislatorbar row">
			<div class="col-xs-6">
				<div id="MultiLegislatorDisplay" class="col-xs-12"></div>
			</div>
			<div class="col-xs-6">
				<div id="ActiveLegislatorDisplay" class="col-xs-12"></div>
			</div>
		</div>
	</div>

	<div class="container-fluid main">
		<div id='maincontent_container'></div><!--dbe this div contain content for "about", "action" etc.  corresponding HTML files are located in folder "images" and named, "maincontent_action.html" etc.-->
	</div>
		
	<!-- EXTRAS -->
	<div id='BillDetailBG'></div>
	<div id='BillDetailMaster'>
		<div id='BillDetailHeader1'></div>
		<div id='BillDetailHeader2'></div>
		<div id='BillDetailHeader3'></div>
		<br>
		<div id='BillDetailOpinionHeader'>OPINION</div>
		<div id='BillDetailOpinionBody'></div>
		<br>
		<div id='BillDetailLinksHeader'>LINKS</div>
		<table id='BillDetailLinksTable'></table>
	</div>
	<div id="ToolTip"></div>

	<script><!--dbe (Load code on index page)-->
		AddressFromForm="<?= $address ?>";
		SessionId=new Date().getTime();
		window.onload=function(){
			Script=document.head.appendChild(document.createElement("script"));
			Script.src="prjx270.js?"+SessionId;
			Script.onload=function(){
				Inits_Main();
			};
		};
	</script>

<?php

include '../includes/footer.php';

function clean($x)
   {
   $x = str_replace("'","",$x);
   $x = str_replace(">","",$x);
   $x = str_replace("<","",$x);
   return $x;
   }

?>
