import { DAPI_BASE_URL } from '../config/dapi-config';
import rp = require('request-promise');
import { ISensorEnlist } from '../types';

export async function requestEnlistSensor(
  authToken: string,
  metadata: string,
  stakeAmount: string,
  price: string
) {
  try {
    const response = await rp({
      method: 'POST',
      uri: DAPI_BASE_URL + '/sensorregistry/enlist',
      body: {
        _metadata: metadata,
        _stakeAmount: stakeAmount,
        _price: price
      },
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      },
      json: true
    });
    return response.uuid;
  } catch (error) {
    console.error('Failed to request sensor enlisting with error', error);
  }
}

export async function waitForEnlistSensor(
  authToken: string,
  sensorEnlistResponseUuid: string
) {}
