import { authenticate } from '../dapi/auth';
import { ISensorEnlist } from '../types';
import { ipfs } from '../dapi/ipfs';
import { listDtxTokenRegistry, listStreamRegistry } from '../dapi/registries';
import { requestDtxAmountApproval } from '../dapi/token';
import { waitFor } from './async';
import { requestEnlistSensor, waitForEnlistSensor } from '../dapi/sensor';
import { DAPI_BASE_URL } from '../config/dapi-config';

export async function enlistSensor(sensor: ISensorEnlist) {
  const authToken = await authenticate();

  const ipfsResponseHash = await ipfs(authToken, sensor.metadata);

  // Fetch contract addresses
  const dtxTokenAddress = await listDtxTokenRegistry(authToken);
  const spenderAddress = await listStreamRegistry(authToken);

  // Approve dtx amount
  const approveDtxAmountResponseUuid = await requestDtxAmountApproval(
    authToken,
    dtxTokenAddress,
    spenderAddress,
    sensor.stakeamount
  );

  // Request approval response for dtx tokens
  await waitFor(
    authToken,
    `${DAPI_BASE_URL}/dtxtoken/${dtxTokenAddress}/approve/${approveDtxAmountResponseUuid}`
  );

  // TODO: re-enable on deployment
  return;
  // Request sensor enlisting
  const sensorEnlistResponseUuid = await requestEnlistSensor(
    authToken,
    ipfsResponseHash,
    sensor.stakeamount,
    sensor.price
  );

  // Request sensor enlisting response
  await waitForEnlistSensor(
    authToken,
    `${DAPI_BASE_URL}/sensorregistry/enlist/${sensorEnlistResponseUuid}`
  );
}
