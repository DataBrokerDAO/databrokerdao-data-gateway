import { getLuftdatenSensors } from '../data/luftdaten';
import {
  transformLuftdatenSensor,
  transformLuftdatenSensorsToSensors,
} from '../data/transform';
import { checkEnlistedDbSensor, enlistDbSensors } from '../mongo/store';
import { ISensor } from '../types';

async function enlistLufdatenSensors() {
  // Fetch and transform sensor data from the Lufdaten API
  const luftDatenSensorsRaw = await getLuftdatenSensors();
  const luftDatenSensors = luftDatenSensorsRaw
    .map(transformLuftdatenSensor)
    .filter(Boolean)
    .filter(
      sensor =>
        !isNaN(sensor.metadata.geo.lat) && !isNaN(sensor.metadata.geo.lng)
    );

  // EnList the sensors
  for (let i = 0; i < luftDatenSensors.length; i++) {
    const type = luftDatenSensors[i].metadata.type;
    if (typeCache[type] === undefined) {
      console.log(luftDatenSensors[i]);
      // TODO: re-enable on deploy, fault place in code?
      const sensorAmount = await checkEnlistedDbSensor(
        luftDatenSensors[i].metadata.sensorid
      );
      console.log(sensorAmount);
      if (sensorAmount < 1) {
        // await enlistSensor(luftDatenSensors[i]);
      }
      typeCache[type] = 1;
    }
  }

  const sensorArray: ISensor[] = transformLuftdatenSensorsToSensors(
    luftDatenSensors
  );
  enlistDbSensors(sensorArray);

  console.log(typeCache);
}
enlistLufdatenSensors();
