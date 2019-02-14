const rp = require('request-promise');
const dotenv = require('dotenv');
const rtrim = require('rtrim');

dotenv.config();

let authToken;

async function authenticate() {
  if (!authenticated()) {
    let baseUrl = rtrim(process.env.DATABROKER_DAPI_BASE_URL, '/');
    let options = {
      method: 'POST',
      uri: `${baseUrl}/accounts/authenticate`,
      body: {
        username: process.env.DAPI_USERNAME,
        password: process.env.DAPI_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      json: true
    };

    await rp(options)
      .then(response => {
        authToken = response.token;
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
