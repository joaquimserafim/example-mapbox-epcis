require('mapbox.js');
var shoe = require('shoe');
var dnode = require('dnode');
var isJSON = require('is-json');

(function (l) {
  var coordinates = document.getElementById('coordinates');
  var origin = [46.53093, 6.5999];
  var stream = shoe('/dnode');
  var d = dnode();
  var map = l.mapbox.map('map', 'mikeandcows.map-remxx6xm').setView(origin, 10);
  var featureLayer = l.mapbox.featureLayer().addTo(map);

  var table = '';

  function lengend (m, props) {
    coordinates.innerHTML = 'Latitude: ' +
      m.lat + '<br />Longitude: ' +
      m.lng + '<br /><hr><h4>EPCIS Event</h4>EventLocation: ' +
      props.epcisEvent.eventLocation + '<br />OperationType: ' +
      props.epcisEvent.operationType + '<br >Timestamp: ' +
      props.epcisEvent.timestamp  + '<br /><hr>';
  }

  function askForPoints (remote) {
    function run () {
      remote.txPoints('beep', function (geo) {
        if (isJSON(geo, true)) {
          console.log('geoJSON: %j', geo.properties);
          // set geoJSON
          featureLayer.setGeoJSON(geo);
          // show
          featureLayer.eachLayer(function (ll) {
            map.panTo(ll.getLatLng());
            lengend(ll.getLatLng(), geo.properties);
          });
        } else {
          console.error('Bad data - "%s"', geo);
        }

        // try another call
        askForPoints(remote);
      });
    }

    setTimeout(run, 1000);
  }

  // dnode events
  d.on('remote', askForPoints);
  d.on('error', function (err) {
    throw new Error(err);
  });
  d.on('end', function () {
    alter('RPC ended!!!');
  });
  // pipe dnode
  d.pipe(stream).pipe(d);

})(L);
