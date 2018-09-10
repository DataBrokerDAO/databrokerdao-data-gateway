const rtrim = require('rtrim');
const auth = require('./auth');
const async = require('async');
const retry = require('../util/async_retry');
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
          auth.authenticate().then(authToken => {
            step(null, authToken);
          });
        },
        function stepIpfsHash(authToken, step) {
          ipfs(authToken, sensor.metadata).then(response => {
            sensor.metadata = response[0].hash;
            step(null, authToken);
          });
        },
        function stepListDtxTokenRegistry(authToken, step) {
          listDtxTokenRegistry(authToken).then(response => {
            let tokenAddress = response.items[0].contractAddress;
            step(null, authToken, tokenAddress);
          });
        },
        function stepListStreamRegistry(authToken, tokenAddress, step) {
          listStreamRegistry(authToken).then(response => {
            let spenderAddress = response.base.contractAddress;
            step(null, authToken, spenderAddress, tokenAddress);
          });
        },
        function stepApproveDtxAmount(
          authToken,
          spenderAddress,
          tokenAddress,
          step
        ) {
          approve(
            authToken,
            tokenAddress,
            spenderAddress,
            sensor.stakeamount
          ).then(response => {
            step(null, authToken, tokenAddress, response.uuid);
          });
        },
        function stepAwaitApproval(authToken, tokenAddress, uuid, step) {
          const url =
            rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') +
            `/dtxtoken/${tokenAddress}/approve/${uuid}`;
          waitFor(authToken, url).then(response => {
            step(null, authToken);
          });
        },
        function stepEnlistSensor(authToken, step) {
          enlist(authToken, sensor).then(response => {
            step(null, authToken, response.uuid);
          });
        },
        function stepAwaitEnlisting(authToken, uuid, step) {
          const url =
            rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') +
            `/sensorregistry/enlist/${uuid}`;
          waitFor(authToken, url).then(response => {
            step(null);
          });
        },
        function done() {
          console.log(`Successfully enlisted sensor ${sensorid}`);
          resolve(sensorid);
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
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/wallet',
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
      _spender: spenderAddress,
      _value: amount
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
    body: {
      _metadata: sensor.metadata,
      _stakeAmount: sensor.stakeamount,
      _price: sensor.price
    },
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    },
    json: true
  });
}

async function waitFor(authToken, url) {
  return await retry(
    async bail => {
      console.log(`Waiting for ${url}`);
      const res = await rp({
        method: 'GET',
        uri: url,
        headers: { Authorization: authToken }
      }).catch(error => {
        bail(error);
      });

      const response = JSON.parse(res);
      if (!(response && response.receipt)) {
        throw new Error('Tx not mined yet');
      }

      if (response.receipt.status === 0) {
        bail(new Error(`Tx with hash ${response.hash} was reverted`));
        return;
      }

      return response.receipt;
    },
    {
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000, // ms
      retries: 120
    }
  );
}

module.exports = {
  enlistSensor
};
