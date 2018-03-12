const coords = require('../util/coords');

const DELIMITER = '!#!';

function createLuftDatenSensorListing(payload) {
  let type;
  let name;
  let price;
  let stakeamount;

  if (typeof payload.pressure !== 'undefined') {
    type = 'pressure';
    name = `Luftdaten Press ${payload.sensor_id}`;
    delete payload.temperature;
    delete payload.humidity;
    price = '80';
    stakeamount = '3200';
  } else if (typeof payload.temperature !== 'undefined') {
    if (Math.round(Math.random()) === 1) {
      type = 'temperature';
      name = `Luftdaten Temp ${payload.sensor_id}`;
      delete payload.humidity;
      price = '120';
      stakeamount = '5800';
    } else {
      type = 'humidity';
      name = `Luftdaten Hum ${payload.sensor_id}`;
      delete payload.temperature;
      price = '120';
      stakeamount = '5800';
    }
  } else if (typeof payload.P1 !== 'undefined') {
    if (Math.round(Math.random()) === 1) {
      type = 'PM2.5';
      name = `Luftdaten PM2.5 ${payload.sensor_id}`;
      delete payload.P1;
      price = '100';
      stakeamount = '4600';
    } else {
      type = 'PM10';
      name = `Luftdaten PM10 ${payload.sensor_id}`;
      delete payload.P2;
      price = '100';
      stakeamount = '4600';
    }
  }

  let sensor = {
    price: price,
    stakeamount: stakeamount,
    metadata: {
      name: name,
      sensorid: `luftdaten${DELIMITER}${payload.sensor_id}${DELIMITER}${payload.sensor_type}`,
      geo: {
        lat: payload.lat,
        lng: payload.lon
      },
      type: type,
      example: JSON.stringify(payload),
      updateinterval: 86400000
    },
    inLeuven: coords.inLeuven(payload)
  };

  if (typeof sensor.metadata.sensorid === 'undefined') {
    return null;
  }

  return sensor;
}

function createCityBikeNycSensorListing(name, payload, example) {
  return {
    price: '10',
    stakeamount: '10',
    metadata: {
      name: name,
      sensorid: `${name}${DELIMITER}${payload.station_id}${DELIMITER}station`,
      geo: {
        lat: payload.lat,
        lng: payload.lon
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
