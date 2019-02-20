import { authenticate } from '../dapi/auth';
import { ISensorEnlist } from '../types';
import { ipfs } from '../dapi/ipfs';
import { listDtxTokenRegistry, listStreamRegistry } from '../dapi/registries';
import { requestDtxAmountApproval } from '../dapi/token';
import { waitFor } from './async';
import { requestEnlistSensor, waitForEnlistSensor } from '../dapi/sensor';

export async function enlistSensors(sensors: ISensorEnlist[]) {
  console.log('Attempting to Enlist multiple sensors');
  try {
    for (const sensor of sensors) {
      let sensorKey: string = sensor.metadata.sensorid;
      try {
        console.log(`Enlisting sensor with ID ${sensorKey}`);
        await enlistSensor(sensor);
        console.log(`Succesfully enlisted sensor with ID ${sensorKey}`);
      } catch (error) {
        console.error(`Failed to enlist sensor with ID ${sensorKey}`, error);
      }

      // TODO: Remove this after testing
      break;
    }
  } catch (error) {
    console.error('Failed to enlisten sensors', error);
  }
  console.log('Succesfully enlisted all sensors');
}

export async function enlistSensor(sensor: ISensorEnlist) {
  // Request authtoken
  const authToken = await authenticate();

  // Post to ipfs
  const ipfsResponseHash = await ipfs(authToken, sensor.metadata);
  sensor.metadata = ipfsResponseHash;

  // List dtxtokenregistry
  const tokenAddress = await listDtxTokenRegistry(authToken);

  // List streamregistry
  const spenderAddress = await listStreamRegistry(authToken, tokenAddress);

  // Approve dtx amount
  const approveDtxAmountResponseUuid = await requestDtxAmountApproval(
    authToken,
    spenderAddress,
    tokenAddress,
    sensor.stakeamount
  );

  // Request approval response for dtx tokens
  await waitFor(authToken, tokenAddress, approveDtxAmountResponseUuid);

  // Request sensor enlisting
  const sensorEnlistResponseUuid = await requestEnlistSensor(authToken, sensor);

  // Request sensor enlisting response
  await waitForEnlistSensor(authToken, sensorEnlistResponseUuid);
}
