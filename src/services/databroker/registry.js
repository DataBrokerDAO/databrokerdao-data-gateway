const rtrim = require('rtrim');
const rp = require('request-promise');
const auth = require('./auth');

const dotenv = require('dotenv');
dotenv.config();
const dapiBaseUrl = process.env.DATABROKER_DAPI_BASE_URL;

async function isEnlisted(metadata) {
  let authToken = auth.authenticate();

  let options = {
    method: 'GET',
    uri: rtrim(dapiBaseUrl, '/') + '/streamregistry/list',
    headers: {
      Authorization: authToken
    }
  };

  let list = await rp(options);

  let address;
  list.items.forEach(item => {
    if (
      !typeof address === 'undefined' &&
      item.metadata.name === metadata.name
    ) {
      address = item.contractAddress;
    }
  });

  return address;
}

async function enlist(metadata) {
  let authToken = auth.authenticate();

  let options = {
    method: 'POST',
    uri: rtrim(dapiBaseUrl, '/') + '/streamregistry/enlist',
    body: {
      price: 10,
      stakeamount: 10
    },
    headers: {
      Authorization: authToken
    },
    json: true
  };

  let address = await rp(options).then(async address => {
    let options = {
      method: 'POST',
      uri: rtrim(dapiBaseUrl, '/') + '/streamregistry/updatestreammetadata',
      body: {
        listing: address,
        ipfshash: await ipfs(metadata)
      },
      headers: {
        Authorization: authToken
      },
      json: true
    };

    return rp(options).then(response => {
      return address;
    });
  });

  return address;
}

async function ipfs(json) {
  let authToken = auth.authenticate();

  let options = {
    method: 'POST',
    uri: rtrim(dapiBaseUrl, '/') + '/ipfs/add/json',
    body: json,
    headers: {
      Authorization: authToken
    },
    json: true
  };

  return rp(options);
}

function ensureListing(metadata) {
  return '0x0b6f4349b3a7df2d7021d43e27176c0bc2035cf0'; // TODO remove hardcoded debug line
  let address = isEnlisted(metadata);

  if (typeof address === 'undefined') {
    address = enlist(metadata);
  }

  return address;
}
module.exports = {
  isEnlisted,
  enlist,
  ensureListing
};
