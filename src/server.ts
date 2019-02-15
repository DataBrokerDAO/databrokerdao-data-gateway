import * as express from 'express';
import * as mongoDbConnection from './services/database/mongoDbConnection'

require('dotenv').load();

const globalAny:any = global;
globalAny.databaseIsInititialized = false;
globalAny.sensorData = [];

const app = express();
const port = process.env.MIDDLEWARE_PORT || 3000; 
const intervalTimeInSeconds = 5;

console.log(process.env);

function bootstrap() {
  setTimeout(bootstrap, 1000 * intervalTimeInSeconds);
  console.log('Hi again!');
  mongoDbConnection.updateDbSensors();
  // app.listen(port, async () => {
  //   console.log(`Listening on port ${port}`);
  //   // store.getCronJobs().then(jobs => {
  //   //   console.log('Registering jobs...');
  //   //   scheduler.registerJobs(jobs);
  //   // });
  // });
}
console.log('Hi!');
bootstrap();