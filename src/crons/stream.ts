import { DATABROKER_CUSTOM_DAPI_BASE_URL } from '../config/dapi-config';
import { getLuftdatenSensors } from '../data/luftdaten';
import { transformLuftdatenSensorsToDataStreamSensors } from '../data/transform';
import express = require('express');
import { IStreamSensor } from '../types';
import Axios from 'axios';

const app = express();

export async function lufdatenCron() {
  // const rawSensors = await getLuftdatenSensors();
  // const streamSensors = await transformLuftdatenSensorsToDataStreamSensors(
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

  streamSensors.map(pushSensorToCustomDapi);
}

async function pushSensorToCustomDapi(sensor: IStreamSensor) {
  try {
    await Axios.post(buildCustomDapiUrl(sensor), sensor);
  } catch (error) {
    console.error(
      `Failed pushing sensor ${sensor.sensorid} to custom DAPI`,
      error
    );
  }
}

function buildCustomDapiUrl(sensor: IStreamSensor) {
  return `${DATABROKER_CUSTOM_DAPI_BASE_URL}/sensorData/${sensor.sensorid}`;
}
