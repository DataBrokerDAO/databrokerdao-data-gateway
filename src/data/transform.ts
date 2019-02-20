import { ILuftDatenSensorResource, ISensorEnlist } from '../types';

// TODO: Make dynamic
const PRICE = 50;
const STAKEAMOUNT = 50;

export function transformLuftdatenSensorsToSensors(rawSensorsDict: {
  string?: ILuftDatenSensorResource;
}): ISensorEnlist[] {
  const sensorArray = [];
  try {
    console.log(
      'Attempting to parse Luftdaten sensors into databrokerdao sensor type'
    );
    for (const rawSensorKey of Object.keys(rawSensorsDict)) {
      const sensor = transformLufdatenSensorToSensor(
        rawSensorsDict[rawSensorKey],
        rawSensorKey
      );
      sensorArray.push(sensor);
    }
    console.log(
      'Succesfully parsed the Luftdaten sensors into databrokerdao sensor type'
    );
    return sensorArray;
  } catch (error) {
    console.error('Failed to parse sensor data!', error);
  }
}

export function transformLufdatenSensorToSensor(
  sensor: ILuftDatenSensorResource,
  rawSensorKey: string
): ISensorEnlist {
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
  };
}
