import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';


export async function getSensors() {
    try {
        const sensorData = await axios("http://api.luftdaten.info/static/v2/data.json");
        return await sensorData;

    } catch (error) {
        console.error(error);
    }
}

export async function parseLuftdaten(sensorData: any) {
    try {
    let count = 0;
    sensorData.data.forEach((sensor: object, index: number) => {
        if (index < 10) {
            console.log(sensor);
        }
        count++;
    });
    console.log('There are currently '  + count + ' sensors active');
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getSensors,
    parseLuftdaten
}