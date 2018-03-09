function inLeuven(coord) {
  if (parseFloat(coord.lat) >= 50.814562 && parseFloat(coord.lat) <= 50.949668) {
    if (parseFloat(coord.lon) >= 4.660596 && parseFloat(coord.lon) <= 4.727477) {
      return true;
    }
  }
  return false;
}

function inBerlin(coord) {
  if (parseFloat(coord.lat) >= 52.338488 && parseFloat(coord.lat) <= 52.671136) {
    if (parseFloat(coord.lon) >= 13.070103 && parseFloat(coord.lon) <= 13.798764) {
      return true;
    }
  }
  return false;
}

module.exports = {
  inLeuven,
  inBerlin
};
