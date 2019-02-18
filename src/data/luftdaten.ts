import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import { ILuftDatenSensorResource, ISensor } from '../types';
import { buildDatabaseDelimiterKey } from '../util/delimit';

const lufdatenApiUrl = 'http://api.luftdaten.info/static/v2/data.json';

const DATAORIGIN = 'LUFTDATEN';

// TODO: add return type
export async function getLuftdatenSensors() {
  try {
    console.log('Trying to fetch sensor data from Luftdaten');
    const sensorData = axios(lufdatenApiUrl);
    console.log('Data succesfully fetched from Luftdaten');
    return sensorData;
  } catch (error) {
    console.error('Failed to fetch Sensor data from Luftdaten', error);
  }
}

export async function parseLuftdatenSensorData(
  sensorData: ILuftDatenSensorResource[]
) {
  try {
    console.log('Trying to parse sensorData');
    // TODO: make this more clean
    const rawSensorDict = {};
    const sensorTypes = {};
    for (const rawSensor of sensorData.data) {
      for (const sensorParameter of rawSensor.sensordatavalues) {
        if (
          sensorTypes[sensorParameter.value_type] === undefined ||
          sensorTypes[sensorParameter.value_type] === null
        ) {
          sensorTypes[sensorParameter.value_type] = 1;
        } else {
          sensorTypes[sensorParameter.value_type]++;
        }
      }
      const rawSensorKey = buildDatabaseDelimiterKey(
        DATAORIGIN,
        rawSensor.sensor.id,
        rawSensor.sensor.sensor_type.name
      );
      rawSensorDict[rawSensorKey] = rawSensor;
    }

    for (const parameterKey of Object.keys(sensorTypes)) {
      console.log(
        `There are ${sensorTypes[parameterKey]} ${parameterKey} sensors`
      );
    }

    console.log('Succesfully parsed sensorData');
    return rawSensorDict;
  } catch (error) {
    console.error('Failed to parse sensor data!', error);
  }
}
