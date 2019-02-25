import express = require('express');
import { lufdatenCron } from './services/stream';
import { MIDDLEWARE_PORT } from './config/dapi-config';
//import { registerJobs } from './cron/scheduler';

require('dotenv').load();

const app = express();

function bootstrap() {
  console.log(MIDDLEWARE_PORT);
  app.listen(MIDDLEWARE_PORT, async () => {
    console.log(`Listening on port ${MIDDLEWARE_PORT}`);

    // TODO: remove?
    // const jobs = await getCronJobs();
  });
}

function init() {
  console.log('Registering jobs...');
  lufdatenCron();
}

init();
bootstrap();
