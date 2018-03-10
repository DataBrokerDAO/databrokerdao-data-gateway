const client = require('../mongo/client');

async function getCronJobByName(name) {
  let collection = await client.getCollection('cron');
  return collection.findOne({ name: name });
}

async function getCronJobs() {
  let collection = await client.getCollection('cron');
  return await collection.find({ status: 'active' }).toArray();
}

async function updateCronJob(job) {
  let collection = await client.getCollection('cron');
  return collection.replaceOne({ name: job.name }, job, { upsert: true });
}

async function isEnlisted(sensorID) {
  let collection = await client.getCollection('streamregistry-items', client.DB_DATABROKER_DAPI);
  let sensor = await collection.findOne({ sensorid: sensorID });
  return sensor !== null;
}

module.exports = {
  getCronJobs,
  getCronJobByName,
  updateCronJob,
  isEnlisted
};
