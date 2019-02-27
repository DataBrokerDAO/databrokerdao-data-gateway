import { CronJob } from 'cron';
import { lufdatenCron } from './crons/stream';

function init() {
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
