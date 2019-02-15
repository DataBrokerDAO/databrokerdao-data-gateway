import axios, {
    AxiosRequestConfig,
    AxiosPromise
} from 'axios';

//TODO: add return type 
export async function getSensors() {
    try {
        const sensorData = await axios("http://api.luftdaten.info/static/v2/data.json");
        return sensorData;

    } catch (error) {
        console.error(error);
    }
}
