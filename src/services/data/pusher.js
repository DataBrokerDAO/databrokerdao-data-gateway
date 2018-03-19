const auth = require('../databroker/auth');
const registry = require('../databroker/registry');
const request = require('request');
const rp = require('request-promise');
const throttledRequest = require('throttled-request')(request);
const promiseRetry = require('promise-retry');
const csv = require('csv-parser');
const rtrim = require('rtrim');
const store = require('./../mongo/store');
const Promise = require('bluebird');
const cache = require('../util/cache');
const moment = require('moment');
const model = require('../model/sensor');
const async = require('async');

require('dotenv').config();
const customDapiBaseUrl = process.env.DATABROKER_CUSTOM_DAPI_BASE_URL;

throttledRequest.configure({
  requests: parseInt(process.env.CONCURRENCY, 10),
  milliseconds: 1000
});

async function pushLuftDaten(job, sourceUrl) {
  let sensor;

  return new Promise((resolve, reject) => {
    let stream = request.get(sourceUrl);

    stream
      .pipe(csv({ separator: ';' }))
      .on('headers', headerList => {
        // Don't care about headers for now
      })
      .on('data', async payload => {
        if (typeof sensor === 'undefined') {
          sensor = model.createLuftDatenSensorListing(payload);
          stream.destroy();
        }
      })
      .on('end', async result => {
        await pushSensorData(sensor, { url: sourceUrl })
          .then(response => {
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      })
      .on('error', error => {
        console.log(`Error while streaming ${error}`);
        reject(error);
      });
  });
}

async function pushCityBikeNyc(job, station, data) {
  return new Promise(async (resolve, reject) => {
    let sensor = model.createCityBikeNycSensorListing(job.name, station, data);
    await pushSensorData(sensor, { data: data })
      .then(response => {
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function pushSensorData(sensor, data) {
  if (typeof sensor === 'undefined' || sensor === null) {
    return Promise.resolve();
  }

  let sensorID;

  try {
    sensorID = await ensureSensorIsListed(sensor);
  } catch (error) {
    return Promise.reject(error);
  }

  let customDapiEndpointUrl = createCustomDapiEndpointUrl(sensorID);
  return rp({
    url: customDapiEndpointUrl,
    method: 'POST',
    body: data,
    json: true
  });
}

function createCustomDapiEndpointUrl(sensorID) {
  let baseUrl = rtrim(customDapiBaseUrl, '/');
  return `${baseUrl}/${encodeURIComponent(sensorID)}/data`;
}

async function ensureSensorIsListed(sensor) {
  return new Promise(async (resolve, reject) => {
    let sensorID = sensor.metadata.sensorid;
    if (typeof cache.listingCache[sensorID] !== 'undefined') {
      return resolve(sensorID);
    }

    let isEnlisted = await store.isEnlisted(sensorID);
    if (isEnlisted) {
      return resolve(sensorID);
    }

    registry
      .enlistSensor(sensor)
      .then(address => {
        cache.listingCache[sensorID] = address;
        resolve(sensorID);
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = {
  pushLuftDaten,
  pushCityBikeNyc
};
