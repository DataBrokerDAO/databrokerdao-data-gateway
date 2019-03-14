import dotenv from 'dotenv';
import rtrim from 'rtrim';

dotenv.load();

export const DAPI_BASE_URL: string = rtrim(
  process.env.DATABROKER_DAPI_BASE_URL || 'https://d3v.databrokerdao.com/dapi',
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

export const SENSOR_UPDATE_INTERVAL = 24 * 3600;

export const DAPI_USERNAME: string = process.env.DAPI_USERNAME;

export const DAPI_PASSWORD: string = process.env.DAPI_PASSWORD;

export const MIDDLEWARE_PORT: number =
  parseInt(process.env.MIDDLEWARE_PORT, 10) || 3000;

export const LUFTDATEN_CRON_TIME: string = '* * 0 * * *';
