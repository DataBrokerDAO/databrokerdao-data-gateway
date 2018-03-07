const rtrim = require('rtrim');
const rp = require('request-promise');
const auth = require('./auth');

require('dotenv').config();
const dapiBaseUrl = process.env.DATABROKER_DAPI_BASE_URL;
const dapiWalletAddress = process.env.DATAGATEWAY_WALLET_ADDRESS;

async function enlist(sensor) {
  sensor.metadata = await ipfs(sensor.metadata);

  await approve(dapiWalletAddress, sensor.stakeamount);

  let options = {
    method: 'POST',
    uri: rtrim(dapiBaseUrl, '/') + '/streamregistry/enlist',
    body: sensor,
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
      return '0x3df2fd51cf19c0d8d1861d6ebc6457a1b0c7496f';
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

async function approve(address, amount) {
  let options = {
    method: 'POST',
    uri: rtrim(dapiBaseUrl, '/') + `/dtxtoken/${address}/approve`,
    body: {
      spender: address,
      value: amount
    },
    headers: {
      Authorization: await auth.authenticate()
    },
    json: true
  };

  return rp(options)
    .then(response => {
      return response;
    })
    .catch(error => {
      console.log(`Error while approving dtx amount, ${error}`);
    });
}

module.exports = {
  enlist
};
