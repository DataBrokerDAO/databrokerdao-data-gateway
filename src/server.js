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
  for (let i = 0; i < 100000000; i++) {
    getRandomCoordInChina();
    if (i > 0 && i % 10000 === 0) {
      console.log('10k iter');
    }
  }
  console.log('DONE');
  // const test =
  // app.listen(process.env.MIDDLEWARE_PORT, async () => {
  //   console.log(`Listening on port ${process.env.MIDDLEWARE_PORT}`);
  //   store.getCronJobs().then(jobs => {
  //     console.log('Registering jobs...');
  //     scheduler.registerJobs(jobs);
  //   });
  // });
}

bootstrap();

function getRandomCoordInChina() {
  // china coords bounding box
  const lonMin = 73.6753792663;
  const lonMax = 135.026311477;
  const latMin = 18.197700914;
  const latMax = 53.4588044297;

  const randomLng = Math.random() * (lonMax - lonMin) + lonMin;
  const randomLat = Math.random() * (latMax - latMin) + latMin;

  const coord = {
    lat: randomLat,
    lon: randomLng
  };
  if (!inChina(coord)) {
    console.log('ERROR');
  }
}

function inChina(coord) {
  if (
    parseFloat(coord.lat) >= 18.197700914 &&
    parseFloat(coord.lat) <= 53.4588044297
  ) {
    if (
      parseFloat(coord.lon) >= 73.6753792663 &&
      parseFloat(coord.lon) <= 135.026311477
    ) {
      return true;
    }
  }
  return false;
}
