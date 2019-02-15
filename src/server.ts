import * as express from 'express';
import * as mongoDbConnection from './services/database/mongoDbConnection'

require('dotenv').load();

const globalAny:any = global;
globalAny.databaseIsInititialized = false;
globalAny.sensorData = [];

const app = express();
const port = process.env.MIDDLEWARE_PORT || 3000; 

console.log(process.env.MONGO_DB_URL);
console.log(process.env.MONGO_DB_NAME);
console.log(process.env.MONGO_DB_SENSOR_COLLECTION);
console.log(port);

mongoDbConnection.updateDbSensors();

function bootstrap() {
  app.listen(port, async () => {
    console.log(`Listening on port ${port}`);
    // store.getCronJobs().then(jobs => {
    //   console.log('Registering jobs...');
    //   scheduler.registerJobs(jobs);
    // });
  });
}

bootstrap();
