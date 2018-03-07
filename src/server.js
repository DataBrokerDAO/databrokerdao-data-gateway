const store = require('./services/mongo/store');
const scheduler = require('./services/cron/scheduler');
const responseTime = require('response-time');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

require('dotenv').config();

app.use(responseTime());
app.use(bodyParser.json());

function bootstrap() {
  app.listen(process.env.MIDDLEWARE_PORT, async () => {
    console.log(`Listening on port ${process.env.MIDDLEWARE_PORT}`);
    console.log('Registering jobs...');
    let jobs = await store.getCronJobs();
    scheduler.registerJobs(jobs);
  });
}

bootstrap();
