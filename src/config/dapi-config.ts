import dotenv from 'dotenv';
import rtrim from 'rtrim';

dotenv.load();

export const DAPI_BASE_URL: string = rtrim(
  process.env.DATABROKER_DAPI_BASE_URL || 'https://dapi.databrokerdao.com',
  '/'
);

export const DATABROKER_CUSTOM_DAPI_BASE_URL: string = rtrim(
  process.env.DATABROKER_CUSTOM_DAPI_BASE_URL,
  '/'
);

export const LUFTDATEN_API_URL: string = rtrim(
  process.env.LUFTDATEN_API_URL ||
    'http://api.luftdaten.info/static/v2/data.json',
  '/'
);

export const MONGO_DB_URL: string = rtrim(process.env.MONGO_DB_URL, '/');

export const MONGO_DB_NAME: string = process.env.MONGO_DB_NAME;

export const MONGO_DB_SENSOR_COLLECTION: string =
  process.env.MONGO_DB_SENSOR_COLLECTION;

export const SENSOR_UPDATE_INTERVAL = 5; //24 * 3600;

export const DAPI_USERNAME: string = process.env.DAPI_USERNAME;

export const DAPI_PASSWORD: string = process.env.DAPI_PASSWORD;

export const MIDDLEWARE_PORT: number =
  parseInt(process.env.MIDDLEWARE_PORT) || 3000;

// TODO: remove?
export const NODE_ENV: string = process.env.NODE_ENV;

export const LUFTDATEN_POLL_SCHEDULE: string = '* 7 16 * *';
