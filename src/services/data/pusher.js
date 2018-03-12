const auth = require('../databroker/auth');
const registry = require('../databroker/registry');
const request = require('request');
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
  let rows = [];

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
          if (sensor === null) {
            // Note we can destory the stream here to save time - we know we're not streaming this data anyway
            stream.destroy();
            return resolve();
          }
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

        await pushLuftDatenSensorData(sensor, rows).catch(error => {
          console.log(`Error while streaming ${error}`);
          reject(error);
        });

        resolve();
      })
      .on('error', error => {
        console.log(`Error while streaming ${error}`);
        reject(error);
      });
  });
}

async function pushLuftDatenSensorData(sensor, rows) {
  let sensorID;

  try {
    // Don't use sensor.metadata.sensorid here - ensure sensor mutates the metadata into an ipfs hash
    sensorID = await ensureSensorIsListed(sensor);
  } catch (error) {
    return Promise.reject(error);
  }

  return Promise.resolve();
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
}

async function pushCityBikeNyc(job, station, status) {
  let sensor = model.createCityBikeNycSensorListing(job.name, station, status);
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
