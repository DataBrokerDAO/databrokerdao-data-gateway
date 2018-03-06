const rp = require('request-promise');
const dotenv = require('dotenv');

dotenv.config();

let authToken;

async function authenticate() {
  if (!authenticated()) {
    let options = {
      method: 'POST',
      uri: `${process.env.DATABROKER_DAPI_BASE_URL}/authenticate`,
      body: {
        privateKeys: {
          ethereum: process.env.DATAGATEWAY_PRIVATE_KEY
        },
        encrypted: false
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      json: true
    };

    await rp(options)
      .then(response => {
        let res = JSON.parse(response);
        authToken = res.token;
      })
      .catch(error => {
        console.log(error);
      });
  }

  return authToken;
}

function authenticated() {
  return typeof authToken !== 'undefined';
}

module.exports = {
  authenticate
};
