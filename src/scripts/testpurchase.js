const rtrim = require('rtrim');
const async = require('async');
const rp = require('request-promise');

require('dotenv').config();

let email = process.argv[2] || 'peterjan.brone@gmail.com';
console.log(`Using email address ${email}`);

async function run() {
  return new Promise((resolve, reject) => {
    async.waterfall(
      [
        function stepWallet(step) {
          let i = 0;
          wallet(email)
            .then(response => {
              step(null, response.privateKey);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepAuthenticate(privateKey, step) {
          authenticate(privateKey)
            .then(response => {
              step(null, response.token);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepMint(authToken, step) {
          mint(authToken)
            .then(response => {
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
        function stepListPurchaseRegistry(authToken, tokenAddress, step) {
          listPurchaseRegistry(authToken)
            .then(response => {
              let spenderAddress = response.base.key;
              step(null, authToken, tokenAddress, spenderAddress);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepApproveDtxAmount(authToken, tokenAddress, spenderAddress, step) {
          let stakeamount = '1000000000';
          approve(authToken, tokenAddress, spenderAddress, stakeamount)
            .then(response => {
              step(null, authToken);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepListStreamRegistry(authToken, step) {
          listStreamRegistry(authToken)
            .then(response => {
              let sensor = response.items[0];
              step(null, authToken, sensor.key);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepIpfsHash(authToken, stream, step) {
          ipfs(authToken, { email })
            .then(response => {
              step(null, authToken, stream, response[0].hash);
            })
            .catch(error => {
              step(new Error(error));
            });
        },
        function stepPurchaseStream(authToken, stream, metadata, step) {
          purchase(authToken, stream, metadata)
            .then(response => {
              if (response.events[0].event === 'AccessPurchased') {
                console.log(`Successfully purchased sensor`);
                resolve();
              } else {
                reject('Purchase event not found');
              }
            })
            .catch(error => {
              reject(error);
            });
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

async function wallet(emailaddress) {
  return rp({
    method: 'POST',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/wallet',
    body: {
      email: emailaddress,
      password: emailaddress
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    json: true
  });
}

async function authenticate(privateKey) {
  return rp({
    method: 'POST',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/authenticate',
    body: {
      privateKeys: {
        ethereum: privateKey
      },
      encrypted: false
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    json: true
  });
}

async function mint(authToken) {
  return rp({
    method: 'POST',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/dtxminter/mint',
    body: {
      amount: '1000000000000'
    },
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

async function listPurchaseRegistry(authToken) {
  return rp({
    method: 'GET',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/purchaseregistry/list',
    headers: {
      Authorization: authToken
    },
    json: true
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

async function allowance(authToken, tokenAddress, ownerAddress, spenderAddress) {
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

async function purchase(authToken, stream, metadata) {
  let body = {
    stream,
    endtime: '1524493209',
    metadata
  };
  return rp({
    method: 'POST',
    uri: rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/') + '/purchaseregistry/purchaseaccess',
    body,
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    },
    json: true
  });
}

run();
