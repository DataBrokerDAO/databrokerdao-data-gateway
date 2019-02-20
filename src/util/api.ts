import { authenticate } from '../dapi/auth';
import { ISensorEnlist } from '../types';
import { ipfs } from '../dapi/ipfs';
import { listDtxTokenRegistry, listStreamRegistry } from '../dapi/registries';
import { requestDtxAmountApproval } from '../dapi/token';
import { waitFor } from './async';

export async function enlistSensor(sensor: ISensorEnlist) {
  const authToken = await authenticate();

  const ipfsResponseHash = await ipfs(authToken, sensor.metadata);
  sensor.metadata = ipfsResponseHash;

  // Fetch contract addresses
  const dtxTokenAddress = await listDtxTokenRegistry(authToken);
  const spenderAddress = await listStreamRegistry(authToken);

  console.log(`DTX ${dtxTokenAddress}`);
  console.log(`Spender ${spenderAddress}`);
  console.log(`Stake Amount ${sensor.stakeamount}`);
 
  // Approve dtx amount
  const approveDtxAmountResponseUuid = await requestDtxAmountApproval(
    authToken,
    dtxTokenAddress,
    spenderAddress,
    sensor.stakeamount
  );

  // Request approval response for dtx tokens
  await waitFor(authToken, dtxTokenAddress, approveDtxAmountResponseUuid);

  // Request sensor enlisting
  //TODO: only enable after changing coordinates to nordpole, enlists now!!!!!!
  //const sensorEnlistResponseUuid = await requestEnlistSensor(authToken, sensor);
  //TODO: only enable after changing coordinates to nordpole, enlists now!!!!!!
  // Request sensor enlisting response
  //await waitForEnlistSensor(authToken, sensorEnlistResponseUuid);
}
