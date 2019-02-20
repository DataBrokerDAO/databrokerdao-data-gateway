import { authenticate } from '../dapi/auth';
import { ILuftDatenSensorResource, ISensorEnlist } from '../types';
import { ipfs } from '../dapi/ipfs';
import { listDtxTokenRegistry } from '../dapi/registries';

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
  await ipfs(authToken, sensor.metadata);

  // List dtxtokenregistry
  await listDtxTokenRegistry(authToken);
  // await dapi.fetchDTXTokenRegistry();
  // await dapi.fetchStreamRegistry();
}

export function ikDoeIetsAnders() {
  // await dapi.auth()
  // await dapi.fetchDTXTokenRegistry();
}
