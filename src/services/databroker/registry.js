const rtrim = require('rtrim');
const auth = require('./auth');
const async = require('async');
const rp = require('request-promise');
const util = require('util');

require('dotenv').config();

async function enlistSensor(sensor) {
  let sensorid = sensor.metadata.sensorid;
  console.log(`Enlisting sensor ${sensorid}`);
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
        function stepApproveDtxAmount(
          authToken,
          spenderAddress,
          tokenAddress,
          step
        ) {
          let stakeamount = parseInt(sensor.stakeamount, 10);
          stakeamount *= 10;
          approve(
            authToken,
            tokenAddress,
            spenderAddress,
            stakeamount.toString()
          )
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
              if (typeof response.events[0] === 'undefined') {
                step(new Error('Enlist event not found'));
              } else {
                step(null, response.events[0].listing);
              }
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function done(address) {
          console.log(
            `Successfully enlisted sensor ${sensorid} at address ${address}`
          );
          resolve(address);
        }
      ],
      error => {
        if (error) {
          reject(error);
        }
      }
    );
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

async function listDtxTokenRegistry(authToken) {
  return rp({
    method: 'GET',
    uri:
      rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') +
      '/dtxtokenregistry/list',
    headers: {
      Authorization: authToken
    },
    json: true
  });
}

async function listStreamRegistry(authToken) {
  return rp({
    method: 'GET',
    uri:
      rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/sensorregistry/list',
    headers: {
      Authorization: authToken
    },
    json: true
  });
}

async function wallet(authToken) {
  return rp({
    method: 'GET',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/my-wallet',
    headers: {
      Authorization: authToken
    },
    json: true
  });
}

async function allowance(
  authToken,
  tokenAddress,
  ownerAddress,
  spenderAddress
) {
  return rp({
    method: 'GET',
    uri:
      rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') +
      `/dtxtoken/${tokenAddress}/allowance?owner=${ownerAddress}&spender=${spenderAddress}`,
    headers: {
      Authorization: authToken
    },
    json: true
  });
}

async function approve(authToken, tokenAddress, spenderAddress, amount) {
  return rp({
    method: 'POST',
    uri:
      rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') +
      `/dtxtoken/${tokenAddress}/approve`,
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
    uri:
      rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') +
      '/sensorregistry/enlist',
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
