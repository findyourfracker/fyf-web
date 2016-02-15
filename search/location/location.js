
// global
var gmarkers = [];

function addEventHandler(oNode, e, oFunc, bCaptures) {
  oNode.addEventListener(e, oFunc, bCaptures);
}

function draw_map(zoom,latctr,lngctr,drop) {

   var options = {
      zoom: zoom,
      center: new google.maps.LatLng(latctr,lngctr),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
   };

   var map = new google.maps.Map(document.getElementById('div3'), options);

   google.maps.event.addListener(map, "click", function(event) {
      var lat = event.latLng.lat();
      var lng = event.latLng.lng();
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map
      });
      for (var i = 0; i < gmarkers.length; i++)
         {
         gmarkers[i].setMap(null);
         }
      gmarkers.push(marker);

      // begin geocode

      var geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(lat,lng);
      geocoder.geocode({'latLng': latlng}, function(results, status) {
         // console.log(results[1].formatted_address);
         // console.log(status);
         if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
               document.getElementById('loc').value = results[1].formatted_address;
               loc();
            } else {
               document.getElementById('loc').value = 'No results found';
            }
          } else {
             document.getElementById('loc').value = 'Geocoder failed due to: ' + status;
          }
      });

      // end goecode

   });

   if (drop == true)
      {
      marker = new google.maps.Marker({
      position: new google.maps.LatLng(latctr,lngctr),
      map: map
   });
   // remove old markers
   for (var i = 0; i < gmarkers.length; i++)
      {
      gmarkers[i].setMap(null);
      }
   gmarkers.push(marker);
   }

}

function loc(e) {
   $.ajax({
      url: "location.php",
      data: {
         location: $("#loc").val()
         },
      success: function(data) {
         $("#div1").html(data);
         // parse data to get coords
         var i1 = data.indexOf('<label>');
         var i2 = data.indexOf('</label>');
         var data1 = data.substring(i1+7,i2);
         var i3 = data1.indexOf(',');
         var latctr = data1.substring(0,i3-1);
         var lngctr = data1.substring(i3+1);
         draw_map(7,latctr,lngctr,true);
         }
   });
}

function initialize() {
   var bCaptures = false;
   addEventHandler(document.getElementById("loc"),"change",loc,bCaptures);
   addEventHandler(document.getElementById("loc"),"focus",loc,bCaptures);
   draw_map(4,37.09,-95.71,false);
   }

addEventHandler(window, "load", function(e) { initialize() } );

