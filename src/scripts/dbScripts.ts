import * as mongoDbConnection from '../database/mongoDbConnection';
import * as luftdaten from '../web modules/luftdaten import/luftdaten';

const globalAny:any = global;

export async function updateDbSensors () {
    const sensorData = await luftdaten.getSensors();
    if (sensorData != null || sensorData !== undefined) {
        globalAny.sensorData = sensorData;
    }
    await mongoDbConnection.compareSensors(sensorData);
}
