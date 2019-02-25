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

  // let rawSensors = await getLuftdatenSensors();
  // let streamSensors = await transformLuftdatenSensorsToDataStreamSensors(
  //   rawSensors
  // );

  const streamSensors = [
    {
      key: 'LUFTDATEN!##!92!##!SDS011',
      sensorid: 92,
      value: '5.285',
      value_type: 'P1',
    },
    {
      key: 'LUFTDATEN!##!93!##!DHT22',
      sensorid: 93,
      value: '18.35',
      value_type: 'humidity',
    },
    {
      key: 'LUFTDATEN!##!113!##!BME280',
      sensorid: 113,
      value: '40.69',
      value_type: 'temperature',
    },
  ];
  let data = { data: streamSensors };

  pushSensorsToCustomDapi(data);
}

async function pushSensorsToCustomDapi(sensors: { data: IStreamSensor[] }) {
  console.log(DATABROKER_CUSTOM_DAPI_BASE_URL, 'hi!!');
  Axios.post(`${DATABROKER_CUSTOM_DAPI_BASE_URL}/sensorData`, sensors).catch(
    error => {
      //console.error(error);
    }
  );
}
