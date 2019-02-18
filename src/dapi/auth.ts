import { rp } from 'request-promise';
import { DAPI_BASE_URL } from '../config/dapi-config';

let authToken: string;

export async function authenticate() {
  if (!authenticated()) {
    const options = {
      method: 'POST',
      uri: `${DAPI_BASE_URL}/accounts/authenticate`,
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

    const response = await rp(options);
    authToken = response.token;
  }

  console.log(`Success! Your authtoken is ${authToken}`);
  return authToken;
}

function authenticated() {
  return typeof authToken !== 'undefined';
}
