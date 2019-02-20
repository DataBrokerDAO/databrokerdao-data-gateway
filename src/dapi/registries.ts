import * as rtrim from 'rtrim';
import { DAPI_BASE_URL } from '../config/dapi-config';
import rp = require('request-promise');

export async function listDtxTokenRegistry(authToken: string) {
  try {
    console.log('Attempting to list dtxtokenregistry');
    const response = await rp({
      method: 'GET',
      uri: DAPI_BASE_URL + '/dtxtokenregistry/list',
      headers: {
        Authorization: authToken
      },
      json: true
    });
    console.log('Dtxtokenregistry listing succesfull!');
    return response.items[0].contractAddress;
  } catch (error) {
    console.error('Dtxtokenregistry listing failed with error', error);
    throw error;
  }
}

export async function listStreamRegistry(
  authToken: string,
  tokenAddress: string
) {
  try {
    console.log('Attempting to list streamregistry');
    const response = await rp({
      method: 'GET',
      uri: DAPI_BASE_URL + '/sensorregistry/list',
      headers: {
        Authorization: authToken
      },
      json: true
    });
    console.log(
      `Succesfully listed streamregistry with tokenaddress ${tokenAddress}`
    );
    return response.uuid;
  } catch (error) {
    console.error('Failed to list streamregistry with error', error);
    throw error;
  }
}
