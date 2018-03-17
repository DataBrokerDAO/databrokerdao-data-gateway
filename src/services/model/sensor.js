const coords = require('../util/coords');

const DELIMITER = '!#!';

function createLuftDatenSensorListing(payload) {
  if (!coords.inBenelux(payload)) {
    // return null;
  }

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
      type = 'PM25';
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
        type: 'Point',
        coordinates: [parseFloat(payload.lat), parseFloat(payload.lon)]
      },
      type: type,
      example: JSON.stringify(payload),
      updateinterval: 86400000
    }
  };

  if (typeof sensor.metadata.sensorid === 'undefined') {
    return null;
  }

  return sensor;
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
        coordinates: [parseFloat(payload.lat), parseFloat(payload.lon)]
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
