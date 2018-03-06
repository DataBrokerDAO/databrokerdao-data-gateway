const auth = require('../databroker/auth');
const registry = require('../databroker/registry');
const request = require('request');
const csv = require('csv-parser');

let authToken;

async function push(job, sourceUrl) {
  ensureListingForSource(sourceUrl)
    .then(address => {
      let targetUrl = 'http://localhost:3000/data';
      stream(sourceUrl, targetUrl);
    })
    .catch(error => {
      console.log(`Error when ensuring ${sourceUrl} was a listed source`);
    });
}

function stream(sourceUrl, targetUrl) {
  // Note we purposefully do not use reqeust-promise here but request instead.
  // Streaming the response is discouraged as it would grow the memory footprint
  // for large requests to unnecessarily high levels.
  request
    .get(sourceUrl)
    .on('data', data => {
      console.log(`Streaming response data: \r\n${data}`);
    })
    .on('error', error => {
      console.log(`Streaming error: ${error}`);
    })
    .pipe(
      request({ uri: targetUrl, method: 'POST' })
        .on('error', error => {
          console.log(`Streaming error while pushing ${error}`);
        })
        .on('end', error => {
          console.log(`Successfully streamed all data!!`);
        })
    );
}

function ensureListingForSource(sourceUrl) {
  return new Promise((resolve, reject) => {
    // Note we purposefully do not use reqeust-promise here but request instead. Streaming the response is discouraged
    // as it would grow the memory footprint for large requests to unnecessarily high levels.
    let stream = request.get(sourceUrl);

    stream
      .pipe(csv({ separator: ';' }))
      .on('headers', headerList => {
        // Don't care about headers for now
      })
      .on('data', data => {
        // As we only need the header ID... let's destroy the stream here
        stream.destroy();

        let sensorID = `${data.sensor_id}!!##!!${data.sensor_type}`;
        let address = registry.ensureListing(sensorID);
        resolve(address);
      });
  });
}

module.exports = {
  push,
  stream
};
