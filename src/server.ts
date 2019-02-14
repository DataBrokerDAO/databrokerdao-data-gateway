import * as express from 'express';
import { accessDb } from './database/mongoDbConnection';
import * as dbScripts from './scripts/dbScripts';
import { Db } from 'mongodb';

const globalAny:any = global;

globalAny.databaseIsInititialized = false;
globalAny.sensorData = [];

const app = express();
const port = 3000; 


app.get('/', (req:any, res:any) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

dbScripts.updateDbSensors();
