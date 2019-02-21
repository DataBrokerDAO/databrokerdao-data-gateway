import { transformLuftdatenSensor } from '../data/transform';
import { enlistSensor } from '../util/api';
import { getLuftdatenSensors } from '../data/luftdaten';

require('dotenv').config();

async function enlistLufdatenSensors() {
  // Fetch and transform sensor data from the Lufdaten API
  const luftDatenSensorsRaw = await getLuftdatenSensors();
  const luftDatenSensors = luftDatenSensorsRaw.map(transformLuftdatenSensor)
    .filter(Boolean)
    .filter(sensor => !isNaN(sensor.metadata.geo.lat) && !isNaN(sensor.metadata.geo.lng));

  // EnList the sensors
  for (let i = 0; i < luftDatenSensors.length; i++) {
    try {
      console.log(`Enlisting sensor ${luftDatenSensors[i].metadata.sensorid}`);
      await enlistSensor(luftDatenSensors[i]);
      total++;
    } catch (error) {
      console.log(`Failed to enlist sensor ${luftDatenSensors[i].metadata.sensorid}`, error);
    }
  }
}
enlistLufdatenSensors();
