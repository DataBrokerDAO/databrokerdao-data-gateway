import {
  transformLuftdatenSensor,
  transformLuftdatenSensorsToSensors,
} from '../data/transform';
import { getLuftdatenSensors } from '../data/luftdaten';
import { enlistDbSensors } from '../services/mongodb';
import { ISensor } from '../types';

require('dotenv').config();

async function enlistLufdatenSensors() {
  // Fetch and transform sensor data from the Lufdaten API
  const luftDatenSensorsRaw = await getLuftdatenSensors();
  const luftDatenSensors = luftDatenSensorsRaw.map(transformLuftdatenSensor)
    .filter(Boolean)
    .filter(sensor => !isNaN(sensor.metadata.geo.lat) && !isNaN(sensor.metadata.geo.lng));

  // EnList the sensors
  for (let i = 0; i < luftDatenSensors.length; i++) {
    const type = luftDatenSensors[i].metadata.type;
    if (typeCache[type] === undefined) {
      console.log(luftDatenSensors[i]);
      // TODO: re-enable on deploy, fault place in code?
      // await enlistSensor(luftDatenSensors[i]);

      typeCache[type] = 1;
    }
  }

  let sensorArray: ISensor[] = transformLuftdatenSensorsToSensors(
    luftDatenSensors
  );
  enlistDbSensors(sensorArray);

  console.log(typeCache);
}
enlistLufdatenSensors();
