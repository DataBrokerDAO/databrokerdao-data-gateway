const auth = require('../databroker/auth');
const registry = require('../databroker/registry');
const request = require('request');
const rp = require('request-promise');
const csv = require('csv-parser');
const rtrim = require('rtrim');
const store = require('./../mongo/store');

require('dotenv').config();
const customDapiBaseUrl = process.env.DATABROKER_CUSTOM_DAPI_BASE_URL;

let listingCache = {};

async function pushLuftDaten(job, sourceUrl) {
  let listing;
  let rows = [];
  let sent = false;
  request
    .get(sourceUrl)
    .pipe(csv({ separator: ';' }))
    .on('headers', headerList => {
      // Don't care about headers for now
    })
    .on('data', payload => {
      if (typeof listing === 'undefined') {
        listing = createLuftDatenSensorListing(job.name, payload);
      }
    })
    .on('end', async result => {
      let sensorID = listing.metadata.sensorid;
      let targetUrl = `${rtrim(customDapiBaseUrl, '/')}/${sensorID}/data`;

      ensureSensorIsListed(sensorID);

      let promiseMap = [];
      rows.forEach(row => {
        promiseMap.push(
          rp({ url: targetUrl, method: 'POST', body: row, json: true }).catch(error => {
            console.log(`Error while pushing ${error}`);
          })
        );
      });

      return Promise.all(promiseMap);
    })
    .on('error', error => {
      console.log(`Error while streaming ${error}`);
    });

  return new Promise((resolve, reject) => {});
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

async function createLuftDatenSensorListing(name, payload) {
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

async function ensureSensorIsListed(sensorID) {
  if (typeof listingCache[sensorID] === 'undefined') {
    let isEnlisted = await store.isEnlisted(sensorID);
    if (!isEnlisted) {
      listingCache[sensorID] = await registry.enlist(listing);
    }
  }
}

module.exports = {
  pushLuftDaten,
  pushCityBikeNyc
};
