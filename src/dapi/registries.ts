import { DAPI_BASE_URL } from '../config/dapi-config';
import rp = require('request-promise');

export async function listDtxTokenRegistry(authToken: string) {
  const response = await rp({
    method: 'GET',
    uri: DAPI_BASE_URL + '/dtxtokenregistry/list',
    headers: {
      Authorization: authToken,
    },
    json: true,
  });
  return response.items[0].contractAddress;
}

export async function listStreamRegistry(authToken: string) {
  const response = await rp({
    method: 'GET',
    uri: DAPI_BASE_URL + '/sensorregistry/list',
    headers: {
      Authorization: authToken,
    },
    json: true,
  });
  return response.base.contractAddress;
}
