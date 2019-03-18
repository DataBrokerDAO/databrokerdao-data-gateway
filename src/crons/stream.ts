import Axios from 'axios';
import express = require('express');
import { DATABROKER_CUSTOM_DAPI_BASE_URL } from '../config/dapi-config';
import { getLuftdatenSensors } from '../data/luftdaten';
import { transformLuftdatenSensorsToDataStreamSensors } from '../data/transform';
import { IStreamSensor } from '../types/types';

const app = express();

export async function lufdatenCron() {
  try {
    const rawSensors = await getLuftdatenSensors();
    const streamSensors = await transformLuftdatenSensorsToDataStreamSensors(
      rawSensors
    );

    postSensorData(streamSensors);
  } catch (error) {
    console.error(error);
  }
}

async function postSensorData(streamSensors: IStreamSensor[]) {
  let chunk;
  const CHUNK_SIZE = 10;

  console.log(`Fetched ${streamSensors.length} sensors from LUFTDATEN`);
  console.log(
    `sending them in batches of ${CHUNK_SIZE} over to the custom DAPI`
  );
  for (let i = 0; i < streamSensors.length; i += CHUNK_SIZE) {
    try {
      chunk = streamSensors.slice(i, i + CHUNK_SIZE);
      const promises = chunk.map(sensor => {
        return Axios.post(buildCustomDapiUrl(sensor), sensor);
      });

      await Promise.all(promises).catch(error => {
        console.error(
          `Failed to push sensordata with error ${error.message || error}`
        );
      });
    } catch (error) {
      console.error(
        `Request failed with status code: ${error.response.status}`
      );
    }
  }
}

function buildCustomDapiUrl(sensor: IStreamSensor) {
  return `${DATABROKER_CUSTOM_DAPI_BASE_URL}/sensorupdate`;
}
