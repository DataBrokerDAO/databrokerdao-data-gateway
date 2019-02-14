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
    for(let index = 0; index < sensorData.data.length; index++) {
        let sensor = sensorData.data[index];
        if (index < 10) {
            console.log(sensor);
        }
    }
    
    console.log('There are currently '  + sensorData.data.length + ' sensors active');
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getSensors,
    parseLuftdaten
}