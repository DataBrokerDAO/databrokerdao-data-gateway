function inLeuven(coord) {
  if (
    parseFloat(coord.lat) >= 50.814562 &&
    parseFloat(coord.lat) <= 50.949668
  ) {
    if (
      parseFloat(coord.lon) >= 4.660596 &&
      parseFloat(coord.lon) <= 4.727477
    ) {
      return true;
    }
  }
  return false;
}

function inBerlin(coord) {
  if (
    parseFloat(coord.lat) >= 52.338488 &&
    parseFloat(coord.lat) <= 52.671136
  ) {
    if (
      parseFloat(coord.lon) >= 13.070103 &&
      parseFloat(coord.lon) <= 13.798764
    ) {
      return true;
    }
  }
  return false;
}

function inBenelux(coord) {
  if (parseFloat(coord.lat) >= 49.2 && parseFloat(coord.lat) <= 53.7) {
    if (parseFloat(coord.lon) >= 2.2 && parseFloat(coord.lon) <= 7.5) {
      return true;
    }
  }
  return false;
}

function inBelgium(coord) {
  if (
    parseFloat(coord.lat) >= 49.5294835476 &&
    parseFloat(coord.lat) <= 51.4750237087
  ) {
    if (
      parseFloat(coord.lon) >= 2.51357303225 &&
      parseFloat(coord.lon) <= 6.15665815596
    ) {
      return true;
    }
  }
  return false;
}

function getRandomCoordInChina() {
  const lonMin = 73.6753792663;
  const lonMax = 135.026311477;
  const latMin = 18.197700914;
  const latMax = 53.4588044297;

  const randomLng = Math.random() * (lonMax - lonMin) + lonMin;
  const randomLat = Math.random() * (latMax - latMin) + latMin;

  const coord = {
    lat: randomLat,
    lon: randomLng
  };

  return coord;
}

module.exports = {
  inLeuven,
  inBerlin,
  inBenelux,
  inBelgium,
  getRandomCoordInChina
};
