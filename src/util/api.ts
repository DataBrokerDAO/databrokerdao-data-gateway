import { authenticate } from '../dapi/auth';
import { ILuftDatenSensorResource, ISensor } from '../types';

export async function enlistSensors(sensors: ILuftDatenSensorResource[]) {
  console.log('Attempting to Enlist multiple sensors');
  try {
    for (const sensorKey of Object.keys(sensorDict)) {
      const sensor = sensorDict[sensorKey];

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

export async function enlistSensor(sensor: ISensor[]) {
  // Request authtoken
  const authToken = await authenticate();

  // Post to ipfs
  await ipfs(authToken, sensor.metadata).then(response => {
    console.log('Step ipfs succesfull, response was: ', response);
    sensor.metadata = response[0].hash;
    step(null, authToken);
  });
  // await dapi.fetchDTXTokenRegistry();
  // await dapi.fetchStreamRegistry();
}

export function ikDoeIetsAnders() {
  // await dapi.auth()
  // await dapi.fetchDTXTokenRegistry();
}
