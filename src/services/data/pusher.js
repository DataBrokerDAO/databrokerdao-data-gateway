const auth = require('../databroker/auth');
const registry = require('../databroker/registry');
const request = require('request');
const rp = require('request-promise');
const csv = require('csv-parser');
const rtrim = require('rtrim');
const store = require('./../mongo/store');
const Promise = require('bluebird');

require('dotenv').config();
const customDapiBaseUrl = process.env.DATABROKER_CUSTOM_DAPI_BASE_URL;

let listingCache = {};

async function pushLuftDaten(job, sourceUrl) {
  let sensor;
  let rows = [];

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
      let sensorID = sensor.metadata.sensorid;
      let baseUrl = rtrim(customDapiBaseUrl, '/');
      let targetUrl = `${baseUrl}/${encodeURIComponent(sensorID)}/data`;
      return Promise.map(
        rows,
        row => {
          return rp({
            url: targetUrl,
            method: 'POST',
            body: row,
            json: true
          }).catch(error => {
            console.log(`Error while pushing sensor data, ${error}`);
          });
        },
        { concurrency: 4 }
      );
    })
    .on('error', error => {
      console.log(`Error while streaming ${error}`);
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
