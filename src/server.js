const store = require('./services/mongo/store');
const scheduler = require('./services/cron/scheduler');
const responseTime = require('response-time');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

require('dotenv').config();

app.use(responseTime());
app.use(bodyParser.json());
  app.listen(process.env.MIDDLEWARE_PORT, async () => {
    console.log(`Listening on port ${process.env.MIDDLEWARE_PORT}`);
    store.getCronJobs().then(jobs => {
      console.log('Registering jobs...');
      scheduler.registerJobs(jobs);
    });
  });
}

bootstrap();
