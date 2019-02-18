import * as express from 'express';
import * as mongoDbConnection from './services/mongodb';
import * as enlistSensors from './scripts/enlistluftdatensensors';
import { ISensor } from './services/model/sensor';

require('dotenv').load();

const app = express();
const intervalTimeInSeconds = 5;

function bootstrap() {
  setTimeout(bootstrap, 1000 * intervalTimeInSeconds);
}
bootstrap();
