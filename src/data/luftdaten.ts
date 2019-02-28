import axios from 'axios';
import { LUFTDATEN_API_URL } from '../config/dapi-config';
import { IRawLuftDatenSensor } from '../types';

export async function getLuftdatenSensors(): Promise<IRawLuftDatenSensor[]> {
  let luftDatenSensors = [];

  try {
    console.log('Fetch LuftDaten sensor data');
    const sensorData = await axios(LUFTDATEN_API_URL);
    luftDatenSensors = sensorData.data;
  } catch (error) {
    console.error('Failed to fetch Sensor data from Luftdaten', error);
  }

  return luftDatenSensors;
}
