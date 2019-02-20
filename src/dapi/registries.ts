import * as rtrim from 'rtrim';
import { DAPI_BASE_URL } from '../config/dapi-config';
import rp = require('request-promise');

export async function listDtxTokenRegistry(authToken: string) {
  console.log('Attempting to list dtxtokenregistry');
  await rp({
    method: 'GET',
    uri: DAPI_BASE_URL + '/dtxtokenregistry/list',
    headers: {
      Authorization: authToken
    },
    json: true
  });
  console.log('DtxTokenRegistry listing succesfull!');
}

export function listStreamTokenRegistry(authToken: string) {
  // TODO: list DTX token registy
}
