# fyf-web
Find Your Fracker

v0.1 of findyourfracker.org

This website uses json data, Google Maps, and the Sunlight API to look up voting records re: fracking for NC legislators. This is intended to be expanded nationally.

The site layout was built with Bootstrap. The prototype search was built by David Egen and resides at:

  search/

The intended production search rewritten in php resides at:

  search/location/location.htm

To use, go to http://sunlightfoundation.com/api/ for a Sunlight API key, and enter it at this file:

  includes/key.php

It may also be necessary to set URL permissions on the Sunlight account to allow lookup to function properly with their API.

Anyone interested in taking this project to the national level is welcome to take over the findyourfracker.org domain.  Just reach out to us.  As of htis writing, (20160226) the prototype search functions are functional for demonstration here:
http://www.findyourfracker.org/
