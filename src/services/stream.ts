import {
  SENSOR_UPDATE_INTERVAL,
  DATABROKER_CUSTOM_DAPI_BASE_URL,
} from '../config/dapi-config';
import { getLuftdatenSensors } from '../data/luftdaten';
import { transformLuftdatenSensorsToDataStreamSensors } from '../data/transform';
import express = require('express');
import { IStreamSensor } from '../types';
import Axios from 'axios';

const app = express();

export async function lufdatenCron() {
  setTimeout(lufdatenCron, 1000 * SENSOR_UPDATE_INTERVAL);
  console.log('Hi from cron!!');

  let rawSensors = await getLuftdatenSensors();
  let streamSensors = await transformLuftdatenSensorsToDataStreamSensors(
    rawSensors
  );

  pushSensorsToCustomDapi(streamSensors);
}

async function pushSensorsToCustomDapi(sensors: IStreamSensor[]) {
  Axios.post(`${DATABROKER_CUSTOM_DAPI_BASE_URL}/data`, sensors).catch(
    error => {
      console.error(error);
    }
  );
}
