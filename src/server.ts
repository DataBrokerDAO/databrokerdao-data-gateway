import axios from 'axios';
import { CronJob } from 'cron';
import {
  DATABROKER_CUSTOM_DAPI_BASE_URL,
  LUFTDATEN_CRON_TIME,
} from './config/dapi-config';
import { lufdatenCron } from './crons/stream';

function init() {
  axios.defaults.baseURL = DATABROKER_CUSTOM_DAPI_BASE_URL;
  console.log('Scheduling LUFTDATEN cron...');
  lufdatenCron();
  new CronJob(
    LUFTDATEN_CRON_TIME,
    async () => {
      await lufdatenCron();
    },
    () => {
      console.log('CRON complete');
    },
    true,
    'Europe/Brussels'
  ).start();
}

init();
