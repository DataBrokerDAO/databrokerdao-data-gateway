import { ipfs } from '../dapi/ipfs';
import { listDtxTokenRegistry, listStreamRegistry } from '../dapi/registries';
import { requestEnlistSensor } from '../dapi/sensor';
import { requestDtxAmountApproval } from '../dapi/token';
import { ISensorEnlist } from '../types';
import { waitFor } from './async';

export async function enlistSensor(sensor: ISensorEnlist) {
  console.log('Skip Enlist');
  // TODO: disable this when you want to deploy sensors
  return;
  const ipfsResponseHash = await ipfs(sensor.metadata);

  // Fetch contract addresses
  const dtxTokenAddress = await listDtxTokenRegistry();
  const spenderAddress = await listStreamRegistry();

  // Approve dtx amount
  const approveDtxAmountResponseUuid = await requestDtxAmountApproval(
    dtxTokenAddress,
    spenderAddress,
    sensor.stakeamount
  );

  // Request approval response for dtx tokens
  await waitFor(
    `/dtxtoken/${dtxTokenAddress}/approve/${approveDtxAmountResponseUuid}`
  );

  // Request sensor enlisting
  const sensorEnlistResponseUuid = await requestEnlistSensor(
    ipfsResponseHash,
    sensor.stakeamount,
    sensor.price
  );

  // Request sensor enlisting response
  await waitFor(`/sensorregistry/enlist/${sensorEnlistResponseUuid}`);
}
