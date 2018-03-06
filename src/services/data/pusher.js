const auth = require('../databroker/auth');
const registry = require('../databroker/registry');
const request = require('request');
const rp = require('request-promise');
const csv = require('csv-parser');
const rtrim = require('rtrim');

const dotenv = require('dotenv');
dotenv.config();
const customDapiBaseUrl = process.env.DATABROKER_CUSTOM_DAPI_BASE_URL;

async function pushLuftDaten(job, sourceUrl) {
  // Note we purposefully do not use reqeust-promise here but request instead. Streaming the response is discouraged
  // as it would grow the memory footprint for large requests to unnecessarily high levels.
  let stream = request.get(sourceUrl);

  let sensorId;
  let rows = [];

  stream
    .pipe(csv({ separator: ';' }))
    .on('headers', headerList => {
      // Don't care about headers for now
    })
    .on('data', payload => {
      // As we only need the header ID... let's destroy the stream here
      if (typeof sensorId === 'undefined') {
        sensorID = `${payload.sensor_id}!!##!!${payload.sensor_type}`;
      }
      rows.push(payload);
    })
    .on('end', result => {
      let address = registry.ensureListing(sensorID);
      let targetUrl = `${rtrim(customDapiBaseUrl, '/')}/${address}/data`;

      let promiseMap = [];
      rows.forEach(row => {
        promiseMap.push(
          rp({
            url: targetUrl,
            method: 'POST',
            body: {
              payload: row,
              address: address
            },
            json: true
          })
        );
      });

      return Promise.all(promiseMap);
    })
    .on('error', error => {
      console.log(`Error in pusher ${error}`);
    });
  return new Promise((resolve, reject) => {});
}

// TODO haven't tested this yet
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

// DISABLED FOR NOW
// function stream(sourceUrl, targetUrl) {
//   // Note we purposefully do not use reqeust-promise here but request instead.
//   // Streaming the response is discouraged as it would grow the memory footprint
//   // for large requests to unnecessarily high levels.
//   request
//     .get(sourceUrl)
//     .on('data', data => {
//       console.log(`Pushing data to ${targetUrl}`);
//     })
//     .on('error', error => {
//       console.log(`Streaming error: ${error}`);
//     })
//     .pipe(
//       request({ uri: targetUrl, method: 'POST' })
//         .on('error', error => {
//           console.log(`Streaming error while pushing ${error}`);
//         })
//         .on('end', error => {
//           console.log(`Successfully streamed all data!!`);
//         })
//     );
// }

module.exports = {
  pushLuftDaten,
  pushCityBikeNyc
};
