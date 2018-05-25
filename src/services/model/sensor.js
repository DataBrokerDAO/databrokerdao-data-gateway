const coords = require('../util/coords');

const DELIMITER = '!#!';

function createLuftDatenSensorListing(payload) {
  if (!coords.inBenelux(payload)) {
    // return null;
  }

  let type;
  let name;
  let priceInDtx;
  let stakeInDtx;

  // 1 DTX should be about 1 week's worth of data
  // .5e-6 DTX should be about 1 second's worth of data
  // 400 DTX should be an average stake amount
  if (typeof payload.pressure !== 'undefined') {
    type = 'pressure';
    name = `Luftdaten Press ${payload.sensor_id}`;
    delete payload.temperature;
    delete payload.humidity;
    priceInDtx = 0.45 * 10 ** -6;
    stakeInDtx = 400;
  } else if (typeof payload.temperature !== 'undefined') {
    if (Math.round(Math.random()) === 1) {
      type = 'temperature';
      name = `Luftdaten Temp ${payload.sensor_id}`;
      delete payload.humidity;
    } else {
      type = 'humidity';
      name = `Luftdaten Hum ${payload.sensor_id}`;
      delete payload.temperature;
    }
    priceInDtx = 0.55 * 10 ** -6;
    stakeInDtx = 500;
  } else if (typeof payload.P1 !== 'undefined') {
    if (Math.round(Math.random()) === 1) {
      type = 'PM25';
      name = `Luftdaten PM2.5 ${payload.sensor_id}`;
      delete payload.P1;
    } else {
      type = 'PM10';
      name = `Luftdaten PM10 ${payload.sensor_id}`;
      delete payload.P2;
    }
    priceInDtx = 0.5 * 10 ** -6;
    stakeInDtx = 450;
  }

  let sensor = {
    price: wDTX(priceInDtx).toString(),
    stakeamount: wDTX(stakeInDtx).toString(),
    metadata: {
      name: name,
      sensorid: `luftdaten${DELIMITER}${payload.sensor_id}${DELIMITER}${
        payload.sensor_type
      }`,
      geo: {
        type: 'Point',
        coordinates: [parseFloat(payload.lon), parseFloat(payload.lat)]
      },
      type: type,
      example: JSON.stringify(payload),
      updateinterval: 86400000,
      sensortype: 'STREAM'
    }
  };

  if (typeof sensor.metadata.sensorid === 'undefined') {
    return null;
  }

  return sensor;
}

function wDTX(dtx) {
  return dtx * 10 ** 18;
}

function createCityBikeNycSensorListing(name, payload, example) {
  return {
    price: '40',
    stakeamount: '1000',
    metadata: {
      name: `Citi Bike NYC ${payload.station_id}`,
      sensorid: `${name}${DELIMITER}${payload.station_id}${DELIMITER}station`,
      geo: {
        type: 'Point',
        coordinates: [parseFloat(payload.lon), parseFloat(payload.lat)]
      },
      type: 'station',
      example: JSON.stringify(example),
      updateinterval: 86400000
    }
  };
}

module.exports = {
  createLuftDatenSensorListing,
  createCityBikeNycSensorListing
};
