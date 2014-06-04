var express = require('express');
var http = require('http');
var shoe = require('shoe');
var dnode = require('dnode');
var fs = require('fs');
var Point = require('./geojson.js');
var JSONFile = require('json-tu-file');


function geoJSON () {
  var geo = [];
  var data = JSONFile.readFileSync('./data/epcis_data.json');

  for (var i = 0; i < data.length; i++) {
    var ele = data[i];
    geo.push(new Point(ele.gpsInfo.gpsLat, ele.gpsInfo.gpsLng, {
      epcisEvent: ele.epcisEvent,
      actions: ele.actions,
      gpsDescription: ele.gpsInfo.gpsDescription
    }));
  }
  return geo;
}

// create the geoJSON's
var geos = {
  __data__: [],
  set: function (cb) {
    this.__data__ = geoJSON();
  },
  size: function () {
    return this.__data__.length;
  },
  get: function () {
    return this.__data__.shift();
  }
};

function main (port) {
  // EXPRESS
  var app = express();
  app.use(express.static(__dirname + '/static'));

  app.get('/', function(req, res){
    res.send('hello world');
  });

  // DNODE stuff
  var sock = shoe(function (stream) {
    var d = dnode({
      txPoints : function (s, cb) {
        if (!geos.size()) {
          geos.set();
          cb(null);
          return;
        }
        var geojson = geos.get();
        cb(geojson);
      }
    });
    d.pipe(stream).pipe(d);
  });

  // HTTP server
  var server = http.createServer(app);
  server.listen(port, function () {
    geos.set();
    console.log('geoJSON:', geos.size());

    sock.install(server, '/dnode');
  });
}

main(3000);
