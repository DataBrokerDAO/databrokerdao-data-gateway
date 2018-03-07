const auth = require('../databroker/auth');
const registry = require('../databroker/registry');
const request = require('request');
const throttledRequest = require('throttled-request')(request);
const csv = require('csv-parser');
const rtrim = require('rtrim');
const store = require('./../mongo/store');
const Promise = require('bluebird');

require('dotenv').config();
const customDapiBaseUrl = process.env.DATABROKER_CUSTOM_DAPI_BASE_URL;

let listingCache = {};

// Throttle requests at 100/s
throttledRequest.configure({
  requests: 20,
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
      .on('data', payload => {
        if (typeof sensor === 'undefined') {
          sensor = createLuftDatenSensorListing(job.name, payload);
          ensureSensorIsListed(sensor);
        }
        rows.push(payload);
      })
      .on('end', async result => {
        resolve();
      })
      .on('error', error => {
        console.log(`Error while streaming ${error}`);
        reject(error);
      });
  });

  let targetUrl = createCustomDapiEndpointUrl(sensor.metadata.sensorid);

  return Promise.map(rows, row => {
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
            console.log(`Error while pushing sensor data, ${error}`);
          }
          resolve(response);
        }
      );
    });
  });
}

async function pushCityBikeNyc(job, sourceUrl) {
  return new Promise((resolve, reject) => {
    // Note we purposefully do not use reqeust-promise here but request instead. Streaming the response is discouraged
    // as it would grow the memory footprint for large requests to unnecessarily high levels.
    let stream = request.get(sourceUrl);

    stream
      .pipe(csv({ separator: ';' }))
      .on('headers', headerList => {
        // Don't care about headers for now
      })
      .on('data', payload => {
        // As we only need the header ID... let's destroy the stream here
        // stream.destroy();

        let sensorID = `${data.sensor_id}!!##!!${data.sensor_type}`;
        let address = registry.ensureListing(sensorID);
        let targetUrl = rtrim(customDapiBaseUrl, '/') + '/data';

        request.post({
          address: address,
          url: targetUrl,
          form: {
            address,
            payload
          }
        });
      })
      .on('end', result => {
        resolve(result);
      });
  });
}

function createLuftDatenSensorListing(name, payload) {
  let delimiter = '!#!';
  return {
    price: '10',
    stakeamount: '10',
    metadata: {
      name: name,
      sensorid: `${name}${delimiter}${payload.sensor_id}${delimiter}${payload.sensor_type}`,
      geo: {
        lat: payload.lat,
        lng: payload.lon
      }
    }
  };
}

function createCustomDapiEndpointUrl(sensorID) {
  let baseUrl = rtrim(customDapiBaseUrl, '/');
  return `${baseUrl}/${encodeURIComponent(sensorID)}/data`;
}

async function ensureSensorIsListed(sensor) {
  let sensorID = sensor.metadata.sensorid;
  if (typeof listingCache[sensorID] === 'undefined') {
    let isEnlisted = await store.isEnlisted(sensorID);
    if (!isEnlisted) {
      listingCache[sensorID] = await registry.enlist(sensor);
    }
  }
}

module.exports = {
  pushLuftDaten,
  pushCityBikeNyc
};
