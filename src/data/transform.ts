import { IRawLuftDatenSensor, ISensorEnlist, IStreamSensor } from '../types/types';

const DELIMITER = '!##!';
const ORIGIN_LUFTDATEN = 'LUFTDATEN';
const SENSORTYPE_STREAM = 'STREAM';

const MIN_PRICE = 30;
const MAX_PRICE = 80;
const STAKEAMOUNT = 0;

export function transformLuftdatenSensorsToSensors(sensors: ISensorEnlist[]) {
  return sensors.map(transformLuftdatenSensorToSensor);
}

function transformLuftdatenSensorToSensor(sensor: ISensorEnlist) {
  return { id: sensor.metadata.sensorid, enlisted: true };
}

export function transformLuftdatenSensor(
  sensor: IRawLuftDatenSensor
): ISensorEnlist {
  let transformed = null;
  transformed = {
    price: Math.floor(
      generatePriceInDTX(calculateRandom()) / 100000
    ).toString(),
    stakeamount: generatePriceInDTX(STAKEAMOUNT).toString(),
    metadata: {
      name: generateName(sensor),
      sensorid: generateSensorId(sensor),
      geo: {
        lat: parseFloat(sensor.location.latitude),
        lng: parseFloat(sensor.location.longitude),
      },
      type: generateType(sensor),
      example: JSON.stringify(sensor.sensordatavalues[0]),
      updateinterval: 86400000, // in ms
      sensortype: SENSORTYPE_STREAM,
    },
  };
  return transformed;
}

export function transformLuftdatenSensorsToDataStreamSensors(
  sensors: IRawLuftDatenSensor[]
): IStreamSensor[] {
  let transformed: IStreamSensor[] = [];
  try {
    transformed = sensors.map(transformLuftdatenSensorToDataStreamSensor);
  } catch (error) {
    throw error;
  }
  return transformed;
}

function transformLuftdatenSensorToDataStreamSensor(
  sensor: IRawLuftDatenSensor
): IStreamSensor {
  try {
    const newSensor: IStreamSensor = {
      key: generateSensorId(sensor),
      sensorid: sensor.sensor.id,
      value: sensor.sensordatavalues[0].value.toString(),
      value_type: sensor.sensordatavalues[0].value_type,
    };
    return newSensor;
  } catch (error) {
    throw error;
  }
}

function generateName(sensor: IRawLuftDatenSensor) {
  const type = generateType(sensor);
  const typeToKey = {
    temperature: 'Temp',
    humidity: 'Hum',
    PM10: 'PM10',
    PM25: 'PM2.5',
  };

  return `Luftdaten ${typeToKey[type]} #${sensor.sensor.id}`;
}

function generateType(sensor: IRawLuftDatenSensor) {
  let type;
  switch (sensor.sensordatavalues[0].value_type) {
    case 'temperature':
      type = 'temperature';
      break;
    case 'humidity':
      type = 'humidity';
      break;
    case 'P1':
      type = 'PM10';
      break;
    case 'P2':
      type = 'PM25';
      break;
    default:
      throw new Error(`Unknown type ${sensor.sensordatavalues[0].value_type}`);
  }
  return type;
}

function generateSensorId(sensor: IRawLuftDatenSensor): string {
  const sensorId = sensor.sensor.id;
  const sensorType = sensor.sensor.sensor_type.name;
  return `${ORIGIN_LUFTDATEN}${DELIMITER}${sensorId}${DELIMITER}${sensorType}`;
}

function generatePriceInDTX(value: number) {
  return value * 10 ** 18;
}

function calculateRandom() {
  let random = Math.random() * (MAX_PRICE - MIN_PRICE + 1) + MIN_PRICE;
  random = Math.floor(random / 10) * 10;
  return random;
}
