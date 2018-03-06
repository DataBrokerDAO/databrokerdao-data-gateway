const store = require('./services/mongo/store');
const scheduler = require('./services/cron/scheduler');
const responseTime = require('response-time');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

app.use(responseTime());
app.use(bodyParser.json());

app.post('/:address/data', (req, res, next) => {
  console.log(`Received data at address ${req.params.address}`);
  console.log(req.body);
  res.send();
});

function bootstrap() {
  app.listen(process.env.MIDDLEWARE_PORT, async () => {
    console.log(`Listening on port ${process.env.MIDDLEWARE_PORT}`);
    console.log('Registering jobs...');
    let jobs = await store.getCronJobs();
    scheduler.registerJobs(jobs);
  });
}

bootstrap();
