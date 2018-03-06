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

app.get('/debug', async (req, res, next) => {
  let jobs = await store.getCronJobs();
  scheduler.registerJobs(jobs);
  // const pusher = require('./services/data/pusher');
  // pusher.stream(
  //   'http://archive.luftdaten.info/2015-10-01/2015-10-01_ppd42ns_sensor_27.csv',
  //   'http://localhost:3000/data'
  // );
  // res.send('Running');
});

app.post('/:address/data', (req, res, next) => {
  console.log(`Received data at address ${req.params.address}`);
  console.log(req.body);
  res.send();
});

// TODO remove - debugging purposes
app.get('/', async (req, res, next) => {
  // const store = require('./services/mongo/store');
  // let tmp = await store.getCronJobs();
  const poller = require('./services/data/poller');
  let html =
    '<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
  let result = poller.parseHtml(html);
  console.log(result);
  var responseText = 'Hello World!<br>';
  res.send(responseText);
});

function bootstrap() {
  app.listen(process.env.MIDDLEWARE_PORT, async () => {
    console.log(`Listening on port ${process.env.MIDDLEWARE_PORT}`);
  });
}

bootstrap();
