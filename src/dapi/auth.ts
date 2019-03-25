import axios from 'axios';
import { DAPI_PASSWORD, DAPI_USERNAME } from '../config/dapi-config';

let authToken: string;

export async function authenticate() {
  try {
    if (!authenticated()) {
      const response = await axios.post(`/v1/users/authenticate`, {
        username: DAPI_USERNAME,
        password: DAPI_PASSWORD,
      });

      authToken = response.data.jwtToken;
      axios.defaults.headers.common.Authorization = authToken;
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
