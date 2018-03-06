const store = require('./services/mongo/store');
const scheduler = require('./services/cron/scheduler');
const responseTime = require('response-time');
const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

app.use(responseTime());

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

app.post('/data', (req, res, next) => {
  req.pipe(process.stdout);
  req.on('end', function() {
    console.log('\r\nfinished');
    res.end();
  });
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
