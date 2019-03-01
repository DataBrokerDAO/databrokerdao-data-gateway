import axios from 'axios';
import { CronJob } from 'cron';
import { DATABROKER_CUSTOM_DAPI_BASE_URL } from './config/dapi-config';
import { lufdatenCron } from './crons/stream';

function init() {
  axios.defaults.baseURL = DATABROKER_CUSTOM_DAPI_BASE_URL;
  console.log('Scheduling LUFTDATEN cron...');
  // TODO: Remove after debugging
  lufdatenCron();
  new CronJob(
    '*/30 * * * * *',
    lufdatenCron,
    lufdatenCron,
    true,
    'Europe/Brussels'
  ).start();
}

init();
