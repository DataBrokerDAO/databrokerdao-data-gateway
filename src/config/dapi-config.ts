import dotenv from 'dotenv';
import { rtrim } from 'rtrim';

dotenv.load();

export const DAPI_BASE_URL: string = rtrim(
    process.env.DATABROKER_DAPI_BASE_URL || "https://dapi.databrokerdao.com/",
    "/"
);
