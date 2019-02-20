import dotenv from 'dotenv';
import rtrim from 'rtrim';

dotenv.load();

export const DAPI_BASE_URL: string = rtrim(
  process.env.DATABROKER_DAPI_BASE_URL || 'https://dapi.databrokerdao.com',
  '/'
);

export const LUFTDATEN_API_URL: string = rtrim(
  process.env.LUFTDATEN_API_URL ||
    'http://api.luftdaten.info/static/v2/data.json',
  '/'
);
