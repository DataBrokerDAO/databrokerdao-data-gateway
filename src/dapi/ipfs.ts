import rp = require('request-promise');
import { DAPI_BASE_URL } from '../config/dapi-config';

export async function ipfs(authToken: string, metadata: object) {
  return rp({
    method: 'POST',
    uri: `${DAPI_BASE_URL}/ipfs/add/json`,
    body: { data: metadata },
    headers: { Authorization: authToken },
    json: true
  });
}
