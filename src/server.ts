import { lufdatenCron } from './crons/stream';
import { CronJob } from 'cron';

function init() {
  console.log('Scheduling LUFTDATEN cron...');
  new CronJob(
    '*/5 * * * * *',
    lufdatenCron,
    lufdatenCron,
    true,
    'Europe/Brussels'
  ).start();
}

init();
