<?php
	$baseurl = 'http://' . $_SERVER['HTTP_HOST'];
	$basepath = $_SERVER['DOCUMENT_ROOT'];
?>

<!doctype html>
<html lang="en">

<html prefix="og: http://ogp.me/ns#">

  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Pro-fracking legislator search. We make it easy to find your fracker.">
<!--    <meta name="description" content="Science-based information about fracking and legislators."> -->
    <meta name="author" content="">
    <meta name="keywords" content="fracking, hydraulic fracturing, fracturing, science, legislator, legislation, vote, who voted for fracking, fact, facts about fracking, legislators who support fracking">
    <link rel="icon" href="<?php echo $baseurl; ?>/images/favicon.ico"> 
    <link rel="icons" href="<?php echo $baseurl; ?>/images/favicon.ico"> 


    <title>Find Your Fracker and Vote Them Out of Office!</title>

<!-- og meta data for social media hooks.  ref: http://opengraphprotocol.org/ -->
    <meta property="og:title" content="Find Your Fracker and Vote Them Out of Office!" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="http://www.findyourfracker.org/" />
    <meta property="og:image" content="http://www.findyourfracker.org/images/fyf-og.png" />
    <meta property="og:description" content="Pro-fracking legislator search. We make it easy to find your fracker." />

    <!-- Bootstrap core CSS -->
    <link href="<?php echo $baseurl; ?>/includes/css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom styles for this template -->
	<link href="<?php echo $baseurl; ?>/includes/style.css" rel="stylesheet">

    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
    <script src="<?php echo $baseurl; ?>/includes/js/ie10-viewport-bug-workaround.js"></script>

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>

  <body>

    <div class="navbar navbar-inverse navbar-fixed-top content topbar" role="navigation">
	  <div class="container-fluid">
        <div class="navbar-header">
			<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>

		<!--	<img src="<?php echo $baseurl; ?>/images/fyf.png"> -->
			<a href="<?php echo $baseurl; ?>"><img src="<?php echo $baseurl; ?>/images/fyf.png"></a>
			<h1 class="header-text"><a href="<?php echo $baseurl; ?>">Find Your Fracker</a></h1>
        </div>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
          	<li><a href="<?php echo $baseurl; ?>/search/">Search</a></li>
            <li><a href="<?php echo $baseurl; ?>/contribute-to-stop-fracking/">Contribute</a></li>
            <li><a href="<?php echo $baseurl; ?>/references/">References</a></li>
            <li><a href="<?php echo $baseurl; ?>/about/">About</a></li>
          </ul>
        </div><!--/.nav-collapse -->
	  </div>
    </div>
