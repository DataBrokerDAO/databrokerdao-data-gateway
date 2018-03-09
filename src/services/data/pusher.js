const auth = require('../databroker/auth');
const registry = require('../databroker/registry');
const request = require('request');
const throttledRequest = require('throttled-request')(request);
const csv = require('csv-parser');
const rtrim = require('rtrim');
const store = require('./../mongo/store');
const Promise = require('bluebird');
const cache = require('../util/cache');
const coords = require('../util/coords');

require('dotenv').config();
const customDapiBaseUrl = process.env.DATABROKER_CUSTOM_DAPI_BASE_URL;

const delimiter = '!#!';

throttledRequest.configure({
  requests: parseInt(process.env.CONCURRENCY, 10),
  milliseconds: 1000
});

async function pushLuftDaten(job, sourceUrl) {
  let sensor;
  let rows = [];
  await new Promise((resolve, reject) => {
    request
      .get(sourceUrl)
      .pipe(csv({ separator: ';' }))
      .on('headers', headerList => {
        // Don't care about headers for now
      })
      .on('data', async payload => {
        if (typeof sensor === 'undefined') {
          sensor = createLuftDatenSensorListing(payload);
        }

        // Note we could call the custom dapi here already with our payload, however calling it on 'end' has proven to improve the
        // Too Many Request issue we've been facing + it ensures the possibly recently enlisted sensor got a chance to sync to mongo
        if (sensor !== null && rows.length < 100) {
          rows.push(payload);
        }
      })
      .on('end', async result => {
        if (typeof sensor === 'undefined' || sensor === null) {
          return resolve();
        }

        return pushLuftDatenSensorData(sensor, rows)
          .then(() => {
            resolve();
          })
          .catch(error => {
            console.log(`Error while streaming ${error}`);
            reject(error);
          });
      })
      .on('error', error => {
        console.log(`Error while streaming ${error}`);
        reject(error);
      });
  });
}

async function pushLuftDatenSensorData(sensor, rows) {
  return ensureSensorIsListed(sensor)
    .then(sensorID => {
      let targetUrl = createCustomDapiEndpointUrl(sensorID);
      return Promise.map(
        rows,
        row => {
          return new Promise((resolve, reject) => {
            throttledRequest(
              {
                url: targetUrl,
                method: 'POST',
                body: row,
                json: true
              },
              (error, response) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(response);
                }
              }
            );
          });
        },
        { concurrency: parseInt(process.env.CONCURRENCY, 10) }
      );
    })
    .catch(error => {
      console.log(`Error while pushing sensor data, ${error}`);
    });
}

async function pushCityBikeNyc(job, station, status) {
  let sensor = createCityBikeNycSensorListing(job.name, station, status);
  return ensureSensorIsListed(sensor)
    .then(sensorID => {
      let targetUrl = createCustomDapiEndpointUrl(sensorID);
      return new Promise((resolve, reject) => {
        throttledRequest(
          {
            url: targetUrl,
            method: 'POST',
            body: status,
            json: true
          },
          (error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          }
        );
      });
    })
    .catch(error => {
      console.log(`Error while pushing sensor data, ${error}`);
    });
}

function createLuftDatenSensorListing(payload) {
  if (!coords.inLeuven(payload)) {
    return null;
  }

  let type;
  let name;

  if (typeof payload.pressure !== 'undefined') {
    type = 'pressure';
    name = `Luftdaten Press ${payload.sensor_id}`;
    delete payload.temperature;
    delete payload.humidity;
  } else if (typeof payload.temperature !== 'undefined') {
    if (Math.random() === 1) {
      type = 'temperature';
      name = `Luftdaten Temp ${payload.sensor_id}`;
      delete payload.humidity;
    } else {
      type = 'humidity';
      name = `Luftdaten Hum ${payload.sensor_id}`;
      delete payload.temperature;
    }
  } else if (typeof payload.P1 !== 'undefined') {
    if (Math.random() === 1) {
      type = 'PM2.5';
      name = `Luftdaten PM2.5 ${payload.sensor_id}`;
      delete payload.P1;
    } else {
      type = 'PM10';
      name = `Luftdaten PM10 ${payload.sensor_id}`;
      delete payload.P2;
    }
  }

  return {
    price: '10',
    stakeamount: '10',
    metadata: {
      name: name,
      sensorid: `luftdaten${delimiter}${payload.sensor_id}${delimiter}${payload.sensor_type}`,
      geo: {
        lat: payload.lat,
        lng: payload.lon
      },
      type: type,
      example: JSON.stringify(payload),
      updateinterval: 86400000
    }
  };
}

function createCityBikeNycSensorListing(name, payload, example) {
  return {
    price: '10',
    stakeamount: '10',
    metadata: {
      name: name,
      sensorid: `${name}${delimiter}${payload.station_id}${delimiter}station`,
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

function createCustomDapiEndpointUrl(sensorID) {
  let baseUrl = rtrim(customDapiBaseUrl, '/');
  return `${baseUrl}/${encodeURIComponent(sensorID)}/data`;
}

async function ensureSensorIsListed(sensor) {
  return new Promise(async (resolve, reject) => {
    try {
      let sensorID = sensor.metadata.sensorid;
      if (typeof cache.listingCache[sensorID] === 'undefined') {
        let isEnlisted = await store.isEnlisted(sensorID);
        if (!isEnlisted) {
          cache.listingCache[sensorID] = await registry.enlistSensor(sensor);
        }
        resolve(sensorID);
      }
    } catch (e) {
      console.log(`Error while enlisting ${e}`);
      reject(e);
    }
  });
}

module.exports = {
  pushLuftDaten,
  pushCityBikeNyc
};
