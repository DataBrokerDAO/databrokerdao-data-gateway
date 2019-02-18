// const model = require('../services/model/sensor');
// const store = require('../services/mongo/store');
// const registry = require('../services/databroker/registry');

import axios, {
    AxiosRequestConfig,
    AxiosPromise
} from "axios";
import { get } from "lodash";
import { ILuftDatenSensorResource } from '../types';
import { enlistSensor } from '../util/api';

//TODO: Improve this code to make it more readable
require("dotenv").config();

const DELIMITER = '!##!';


async function enlistSensors () {
    // Fetch sensor data from the Lufdaten API
    const data = await lufdaten.getSensors();

    // Parse json into dictionary
    const rawSensorDict = await lufdaten.parseSensorData(data);
    
    // Loop every "sensor object" from the JSON and transform into a LuftDatenSensor type
    const sensorDict = lufdaten.transformrawSensorDictToSensorsDict (rawSensorDict);

    // List the sensors to databrokerdao
    await enlistSensor(sensors);
}

// Pseudo code

const rawSensorDict = {};
function parse(dataJSONResponse: string) {
    for (const sensor of JSON.parse(dataJSONResponse)) {
        const key = buildKey(get(sensor, 'sensor.id'), get(sensor, 'sensor.sensor_type.id'));
        if (!rawSensorDict[key]) {
            rawSensorDict[key] = sensor;
        }
    }
}

const sensorDict = {};
async function enlistt() {
    // 1. download data.json from luftdaten API
    const data = await axios('http://api.luftdaten.info/static/v2/data.json');

    // 2. parse JSON into custom data structure and ensure you have a dictionary of all unique sensors
    await parse(data);

    // 3. loop every "sensor object" from the JSON and transform into a LuftDatenSensor type
    for (const key of Object.keys(rawSensorDict)) {
        let sensor = rawSensorDict[key];
        sensor = transformToLuftDatenSensor(rawSensorDict[key]);
        sensorDict[key] = sensor;
    }

    // 4. enlist sensor with DatabrokerDAO DAPI
    for (const key of Object.keys(rawSensorDict)) {
        const sensor = sensorDict[key];

        try {
        // TODO await enlistSensor(sensor)
        } catch(error) {
            console.log('Failed enlisting sensor w/ID:', error);
        }

        try {
            // TODO await markSensorAsEnlisted()
        } catch(error) {
            console.log('Failed marking sensor w/ID as enlisted:', error);
        }
        
    }
}

function markSensorAsEnlisted(sensor: ILuftDatenSensorResource) {
    // mongo
    // mongo.upsert ({
        // sensorId: whatever
        // enlisted: new Date()
    // })
}

function transformToLuftDatenSensor(sensor: data): ILuftDatenSensorResource {
    // return {
    //     price: '50',
    //     stakeamount: '400',
    //     metadata: {
    //       name: 'Test',
    //       sensorid: '345',
    //       geo: {
    //         lat: 12.145,
    //         lng: 19.93
    //       },
    //       type: 'UM12',
    //       example: 'example',
    //       updateinterval: 500,
    //       sensortype: 'UM14'
    //     }
    // }
}



function buildKey(sensorId: string, sensorType: string): string {
    return `LUFTDATEN${DELIMITER}${sensorId}${DELIMITER}${sensorType}`; 
}

enlistSensors();

