import Axios from 'axios';
import express = require('express');
import { DATABROKER_CUSTOM_DAPI_BASE_URL } from '../config/dapi-config';
import { getLuftdatenSensors } from '../data/luftdaten';
import { transformLuftdatenSensorsToDataStreamSensors } from '../data/transform';
import { IStreamSensor } from '../types';

const app = express();

export async function lufdatenCron() {
  const rawSensors = await getLuftdatenSensors();
  const streamSensors = await transformLuftdatenSensorsToDataStreamSensors(
    rawSensors
  );

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
  return `${DATABROKER_CUSTOM_DAPI_BASE_URL}/sensor/data`;
}
