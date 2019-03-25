import { listSensorRegistry } from '../dapi/registries';
import { getLuftdatenSensors } from '../data/luftdaten';
import { transformLuftdatenSensor } from '../data/transform';

import { ISensorEnlist } from '../types/types';
import { enlistSensor } from '../util/api';

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

  const registeredSensors: ISensorEnlist[] = await listSensorRegistry();
  const registeredSensorsDict = new Map(
    registeredSensors.map(
      (sensor): [string, boolean] => [sensor.metadata.sensorid, true]
    )
  );

  // EnList the sensors
  for (let i = 0; i < luftDatenSensors.length; i++) {
    const luftDatenSensor = luftDatenSensors[i];
    if (registeredSensorsDict[luftDatenSensor.metadata.sensorid] !== true) {
      await enlistSensor(luftDatenSensors[i]);
    }
  }
}
enlistLufdatenSensors();
