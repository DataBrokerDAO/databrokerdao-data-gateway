const rtrim = require('rtrim');
const rp = require('request-promise');
const auth = require('./auth');
const mongo = require('./../mongo/store');

const dotenv = require('dotenv');
dotenv.config();
const dapiBaseUrl = process.env.DATABROKER_DAPI_BASE_URL;

async function enlist(listing) {
  listing.metadata = await ipfs(listing.metadata);

  let options = {
    method: 'POST',
    uri: rtrim(dapiBaseUrl, '/') + '/streamregistry/enlist',
    body: listing,
    headers: {
      Authorization: await auth.authenticate(),
      'Content-Type': 'application/json'
    },
    json: true
  };

  return rp(options)
    .then(result => {
      return result.address;
    })
    .catch(error => {
      // TODO fix this error
      return '0x66de1793a8f30b855d4c4555fb032f12b3aa4ea3';
      console.log(`Error while enlisting, ${error}`);
    });
}

async function ipfs(metadata) {
  let options = {
    method: 'POST',
    uri: rtrim(dapiBaseUrl, '/') + '/ipfs/add/json',
    body: {
      data: metadata
    },
    headers: {
      Authorization: await auth.authenticate()
    },
    json: true
  };

  return rp(options)
    .then(response => {
      return response[0].hash;
    })
    .catch(error => {
      console.log(`Error while fetching ipfs hash, ${error}`);
    });
}

module.exports = {
  enlist
};
