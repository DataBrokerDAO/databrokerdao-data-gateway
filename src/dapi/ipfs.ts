import rp = require('request-promise');
import { DAPI_BASE_URL } from '../config/dapi-config';

export async function ipfs(authToken: string, metadata: object) {
  try {
    const response = await rp({
      method: 'POST',
      uri: `${DAPI_BASE_URL}/v1/ipfs/add/json`,
      body: { data: metadata },
      headers: { Authorization: authToken },
      json: true,
    });
    return response[0].hash;
  } catch (error) {
    console.error(
      'Failed to add sensor metadata to databrokerdao ipfs storage with error',
      error
    );
    throw error;
  }
}
