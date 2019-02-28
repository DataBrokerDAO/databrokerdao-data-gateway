import rp = require('request-promise');
import {
  DAPI_BASE_URL,
  DAPI_PASSWORD,
  DAPI_USERNAME,
} from '../config/dapi-config';

let authToken: string;

export async function authenticate() {
  try {
    if (!authenticated()) {
      const options = {
        method: 'POST',
        uri: `${DAPI_BASE_URL}/dapi/v1/users/authenticate`,
        body: {
          username: DAPI_USERNAME,
          password: DAPI_PASSWORD,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        json: true,
      };

      const response = await rp(options);
      authToken = response.jwtToken;
    }
    return authToken;
  } catch (error) {
    console.error('Failed to authenticate with error', error);
    throw error;
  }
}

function authenticated() {
  return typeof authToken !== 'undefined';
}
