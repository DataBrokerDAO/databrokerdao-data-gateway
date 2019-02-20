import { DAPI_BASE_URL } from '../config/dapi-config';
import rp = require('request-promise');
import { ISensorEnlist } from '../types';

export async function requestEnlistSensor(
  authToken: string,
  sensor: ISensorEnlist
) {
  try {
    console.log(`Requesting sensor enlisting for sensor`);
    const response = await rp({
      method: 'POST',
      uri: DAPI_BASE_URL + 'sensorregistry/enlist',
      body: {
        _metadata: sensor.metadata,
        _stakeAmount: sensor.stakeamount,
        _price: sensor.price
      },
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      },
      json: true
    });
    console.log('Succesfully requested sensor enlisting!');
    return response.uuid;
  } catch (error) {
    console.error('Failed to request sensor enlisting with error', error);
  }
}

export async function waitForEnlistSensor(
  authToken: string,
  sensorEnlistResponseUuid: string
) {}
