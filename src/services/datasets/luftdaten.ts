import axios, {
    AxiosRequestConfig,
    AxiosPromise
} from 'axios';

import {ILuftDatenSensorResource, ISensor} from '../types';
import { promises } from 'fs';
import { try } from 'bluebird';

const lufdatenApiUrl = 'http://api.luftdaten.info/static/v2/data.json';

const DELIMITER = '!##!';

const PRICE = 50;
const STAKEAMOUNT = 50;

//TODO: add return type 
export async function getSensors() {
        try {
            console.log('Trying to fetch sensor data from Luftdaten');
            const sensorData = axios(lufdatenApiUrl);
            console.log('Data succesfully fetched from Luftdaten');
            return sensorData;
    
        } catch (error) {
            console.error('Failed to fetch Sensor data from Luftdaten', error);
        }
}

export async function parseSensorData(sensorData: ILuftDatenSensorResource[]) {
    try {
        console.log('Trying to parse sensorData');
        var rawSensorDict = {};
        for (const rawSensor of sensorData.data) {
            const rawSensorKey = buildKey(rawSensor.sensor.id, rawSensor.sensor.sensor_type.name);
            rawSensorDict[rawSensorKey]=rawSensor; 
        }
        console.log('Succesfully parsed sensorData');
        return rawSensorDict;
    } catch (error) {
        console.error('Failed to parse sensor data!', error);
    }
}

function buildKey(sensorId: number, sensorType: string): string {
    return `LUFTDATEN${DELIMITER}${sensorId}${DELIMITER}${sensorType}`; 
}

export function transformrawSensorDictToSensorsDict (rawSensorsDict) {
    const sensorDict = {};
    try {
        console.log('Attempting to parse Luftdaten sensors into databrokerdao sensor type');
        for (const rawSensorKey of Object.keys(rawSensorsDict)) {
            let sensor = transformRawSensorToSensor(rawSensorsDict[rawSensorKey], rawSensorKey);
            sensorDict[rawSensorKey] = sensor;
        }
        console.log('Succesfully parsed the Luftdaten sensors into databrokerdao sensor type')
        return sensorDict;
    } catch (error) {
        console.error('Failed to parse sensor data!', error);
    }

}

export function transformRawSensorToSensor(sensor: ILuftDatenSensorResource, rawSensorKey): ISensor {

    return {
        price: PRICE,
        stakeamount: STAKEAMOUNT,
        metadata: {
          name: sensor.sensor.sensor_type.name,
          sensorid: rawSensorKey,
          geo: {
            lat: sensor.location.latitude,
            lng: sensor.location.longitude
          },
          type: sensor.sensor.sensor_type.name,
          example: sensor.sensordatavalues[0].value.toString(),
          updateinterval: 500,
          sensortype: sensor.sensor.sensor_type.name
        }
    }
}
