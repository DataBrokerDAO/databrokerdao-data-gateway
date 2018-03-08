const auth = require('../databroker/auth');
const registry = require('../databroker/registry');
const request = require('request');
const throttledRequest = require('throttled-request')(request);
const csv = require('csv-parser');
const rtrim = require('rtrim');
const store = require('./../mongo/store');
const Promise = require('bluebird');
const cache = require('../util/cache');

require('dotenv').config();
const customDapiBaseUrl = process.env.DATABROKER_CUSTOM_DAPI_BASE_URL;

throttledRequest.configure({
  requests: 4,
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
          sensor = createLuftDatenSensorListing(job.name, payload);
        }

        // Note we could call the custom dapi here already with our payload, however calling it on 'end' has proven to improve the
        // Too Many Request issue we've been facing + it ensures the possibly recently enlisted sensor got a chance to sync to mongo
        rows.push(payload);
      })
      .on('end', async result => {
        return pushLuftDatenCensorData(sensor, rows)
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

async function pushLuftDatenCensorData(sensor, rows) {
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
        { concurrency: 4 }
      );
    })
    .catch(error => {
      console.log(`Error while pushing sensor data, ${error}`);
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
