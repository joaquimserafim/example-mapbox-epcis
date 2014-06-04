module.exports = Point;

function Point (lat, lon, props) {
  if (!(this instanceof Point)) return new Point(lat, lon, props);

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lon, lat]
    },
    properties: props
  };
}
