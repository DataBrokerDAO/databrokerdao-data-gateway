import client = require('./client');
import { ISensor, ISensorEnlist, IJob } from '../types';
import { MONGO_DB_SENSOR_COLLECTION } from '../config/dapi-config';

export async function checkEnlistedDbSensor(sensorId: string) {
  let sensors = [];
  let collection = await client.getCollection(MONGO_DB_SENSOR_COLLECTION);
  collection
    .find({ id: sensorId })
    .count()
    .then((amount: number) => {
      return amount;
    });
}

export async function enlistDbSensors(sensors: ISensor[]) {
  let collection = await client.getCollection(MONGO_DB_SENSOR_COLLECTION);

  collection.insertMany(sensors);
}

export async function enlistDbSensor(sensor: ISensorEnlist) {
  let collection = await client.getCollection(MONGO_DB_SENSOR_COLLECTION);
  collection.updateOne(
    { id: sensor.metadata.sensorid },
    { $set: { id: sensor.metadata.sensorid, enlisted: true } },
    { upsert: true }
  );
}

// TODO: remove?
export async function getCronJobByName(name: string) {
  let collection = await client.getCollection('cron');
  return collection.findOne({ name: name });
}

export async function getCronJobs() {
  let collection = await client.getCollection('cron');
  return await collection.find({ status: 'active' }).toArray();
}

export async function updateCronJob(job: IJob) {
  let collection = await client.getCollection('cron');
  return await collection.replaceOne({ name: job.name }, job, { upsert: true });
}
