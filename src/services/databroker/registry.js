const rtrim = require('rtrim');
const auth = require('./auth');
const async = require('async');
const rp = require('request-promise');

require('dotenv').config();

async function enlistSensor(sensor) {
  return new Promise((resolve, reject) => {
    async.waterfall(
      [
        function stepIfsHash(step) {
          ipfs(sensor.metadata)
            .then(response => {
              sensor.metadata = response[0].hash;
              step();
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepListDtxTokenRegistry(step) {
          list()
            .then(response => {
              let spenderAddress = response.base.key;
              let tokenAddress = response.items[0].contractaddress;
              step(null, spenderAddress, tokenAddress);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepApproveDtxAmount(spenderAddress, tokenAddress, step) {
          approve(tokenAddress, spenderAddress, sensor.stakeamount)
            .then(response => {
              step();
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepEnlistSensor(step) {
          enlist(sensor)
            .then(response => {
              step(null, response);
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

async function list() {
  let options = {
    method: 'GET',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/dtxtokenregistry/list',
    headers: {
      Authorization: await auth.authenticate()
    },
    json: true
  };

  return rp(options);
}

async function ipfs(metadata) {
  let options = {
    method: 'POST',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/ipfs/add/json',
    body: {
      data: metadata
    },
    headers: {
      Authorization: await auth.authenticate()
    },
    json: true
  };

  return rp(options);
}

async function approve(tokenAddress, spenderAddress, amount) {
  let options = {
    method: 'POST',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + `/dtxtoken/${tokenAddress}/approve`,
    body: {
      spender: spenderAddress,
      value: amount
    },
    headers: {
      Authorization: await auth.authenticate()
    },
    json: true
  };

  return rp(options);
}

async function enlist(sensor) {
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

  return rp(options);
}

module.exports = {
  enlistSensor
};
