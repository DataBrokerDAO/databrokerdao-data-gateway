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
  const luftDatenSensors = luftDatenSensorsRaw
    .map(transformLuftdatenSensor)
    .filter(Boolean);

  const typeCache = {};

  // EnList the sensors
  for (let i = 0; i < luftDatenSensors.length; i++) {
    const type = luftDatenSensors[i].metadata.type;
    if (typeCache[type] === undefined) {
      console.log(luftDatenSensors[i]);
      // TODO: re-enable on deploy, fault place in code?
      // await enlistSensor(luftDatenSensors[i]);

      typeCache[type] = 1;
    }
    typeCache[type]++;
  }

  let sensorArray: ISensor[] = transformLuftdatenSensorsToSensors(
    luftDatenSensors
  );
  enlistDbSensors(sensorArray);

  console.log(typeCache);
}
enlistLufdatenSensors();

/*tslint:disable*/

// Pseudo code
// const rawSensorDict = {};
// function parse(dataJSONResponse: string) {
//   for (const sensor of JSON.parse(dataJSONResponse)) {
//     const key = buildKey(
//       get(sensor, 'sensor.id'),
//       get(sensor, 'sensor.sensor_type.id')
//     );
//     if (!rawSensorDict[key]) {
//       rawSensorDict[key] = sensor;
//     }
//   }
// }

// const sensorDict = {};
// async function enlistt() {
//   // 1. download data.json from luftdaten API
//   const data = await axios('http://api.luftdaten.info/static/v2/data.json');

//   // 2. parse JSON into custom data structure and ensure you have a dictionary of all unique sensors
//   await parse(data);

//   // 3. loop every "sensor object" from the JSON and transform into a LuftDatenSensor type
//   for (const key of Object.keys(rawSensorDict)) {
//     let sensor = rawSensorDict[key];
//     sensor = transformToLuftDatenSensor(rawSensorDict[key]);
//     sensorDict[key] = sensor;
//   }

//   // 4. enlist sensor with DatabrokerDAO DAPI
//   for (const key of Object.keys(rawSensorDict)) {
//     const sensor = sensorDict[key];

//     try {
//       // TODO await enlistSensor(sensor)
//     } catch (error) {
//       console.log('Failed enlisting sensor w/ID:', error);
//     }

//     try {
//       // TODO await markSensorAsEnlisted()
//     } catch (error) {
//       console.log('Failed marking sensor w/ID as enlisted:', error);
//     }
//   }
// }

// function markSensorAsEnlisted(sensor: ILuftDatenSensorResource) {
//   // mongo
//   // mongo.upsert ({
//   // sensorId: whatever
//   // enlisted: new Date()
//   // })
// }

// function transformToLuftDatenSensor(sensor: data): ILuftDatenSensorResource {
//   // return {
//   //     price: '50',
//   //     stakeamount: '400',
//   //     metadata: {
//   //       name: 'Test',
//   //       sensorid: '345',
//   //       geo: {
//   //         lat: 12.145,
//   //         lng: 19.93
//   //       },
//   //       type: 'UM12',
//   //       example: 'example',
//   //       updateinterval: 500,
//   //       sensortype: 'UM14'
//   //     }
//   // }
// }

// function buildKey(sensorId: string, sensorType: string): string {
//   return `LUFTDATEN${DELIMITER}${sensorId}${DELIMITER}${sensorType}`;
// }
/*tslint:enable*/
