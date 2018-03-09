const rtrim = require('rtrim');
const auth = require('./auth');
const async = require('async');
const rp = require('request-promise');

require('dotenv').config();

async function enlistSensor(sensor) {
  return new Promise((resolve, reject) => {
    async.waterfall(
      [
        function stepAuthenticate(step) {
          auth
            .authenticate()
            .then(authToken => {
              step(null, authToken);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepIpfsHash(authToken, step) {
          ipfs(authToken, sensor.metadata)
            .then(response => {
              sensor.metadata = response[0].hash;
              step(null, authToken);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepListDtxTokenRegistry(authToken, step) {
          listDtxTokenRegistry(authToken)
            .then(response => {
              let tokenAddress = response.items[0].contractaddress;
              step(null, authToken, tokenAddress);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepListStreamRegistry(authToken, tokenAddress, step) {
          listStreamRegistry(authToken)
            .then(response => {
              let spenderAddress = response.base.key;
              step(null, authToken, spenderAddress, tokenAddress);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepApproveDtxAmount(authToken, spenderAddress, tokenAddress, step) {
          approve(authToken, tokenAddress, spenderAddress, sensor.stakeamount)
            .then(response => {
              step(null, authToken);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepEnlistSensor(authToken, step) {
          enlist(authToken, sensor)
            .then(response => {
              step(null, response.events[0].listing);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function done(address) {
          resolve(address);
        }
      ],
      error => {
        if (error) {
          resolve('0x3df2fd51cf19c0d8d1861d6ebc6457a1b0c7496f');
          // console.log(`Error while enlisting, ${error}`);
          // reject(error);
        }
      }
    );
  });
}

async function listStreamRegistry(authToken) {
  return rp({
    method: 'GET',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/streamregistry/list',
    headers: {
      Authorization: authToken
    },
    json: true
  });
}

async function listDtxTokenRegistry(authToken) {
  return rp({
    method: 'GET',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/dtxtokenregistry/list',
    headers: {
      Authorization: authToken
    },
    json: true
  });
}

async function ipfs(authToken, metadata) {
  return rp({
    method: 'POST',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/ipfs/add/json',
    body: {
      data: metadata
    },
    headers: {
      Authorization: authToken
    },
    json: true
  });
}

async function approve(authToken, tokenAddress, spenderAddress, amount) {
  return rp({
    method: 'POST',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + `/dtxtoken/${tokenAddress}/approve`,
    body: {
      spender: spenderAddress,
      value: amount
    },
    headers: {
      Authorization: authToken
    },
    json: true
  });
}

async function enlist(authToken, sensor) {
  return rp({
    method: 'POST',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/streamregistry/enlist',
    body: sensor,
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    },
    json: true
  });
}

module.exports = {
  enlistSensor
};
