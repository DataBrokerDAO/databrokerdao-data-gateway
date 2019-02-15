import * as express from 'express';
import * as mongoDbConnection from './services/database/mongoDbConnection'
import * as enlistSensors from './scripts/enlistSensors';
import {
  ISensor
} from './services/model/sensor';

require('dotenv').load();

const globalAny: any = global;
//TODO: 
globalAny.databaseIsInititialized = false;
globalAny.sensorData = [];

const app = express();
//TODO:  Fix process.env
const port = process.env.MIDDLEWARE_PORT || 3000;
const intervalTimeInSeconds = 5;

var tempSensor: ISensor = {
price: '50',
stakeamount: '400',
metadata: {
  name: 'Test',
  sensorid: '345',
  geo: {
    lat: 12.145,
    lng: 19.93
  },
  type: 'UM12',
  example: 'example',
  updateinterval: 500,
  sensortype: 'UM14'
}
}

function bootstrap() {
  setTimeout(bootstrap, 1000 * intervalTimeInSeconds);
  console.log('Hi again!');
  mongoDbConnection.updateDbSensors();
}
console.log('Hi!');
console.log('Running sensor enlisting script');
enlistSensors.enlistSensor(tempSensor);
bootstrap();
