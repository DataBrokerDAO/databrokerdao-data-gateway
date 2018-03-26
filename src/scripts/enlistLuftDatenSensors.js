const model = require('../services/model/sensor');
const store = require('../services/mongo/store');
const registry = require('../services/databroker/registry');
const request = require('request');
const csv = require('csv-parser');

const LuftDaten = require('./../services/data/scrapers/luftdaten');

async function getSensorList() {
  let out = { lastKey: 0 };
  let archives = await LuftDaten.scanForArchives('http://archive.luftdaten.info/', out);
  if (archives.length > 1) {
    archives = archives.slice(-1);
  }

  let sensorList = await LuftDaten.scanArchivesForCsvs(archives);
  return sensorList;
}

async function enlist() {
  let sensorUrlList = await getSensorList();
  for (let i = 0; i < sensorUrlList.length; i++) {
    let sensor = await createSensor(sensorUrlList[i]);
    let sensorID = sensor.metadata.sensorid;
    let isEnlisted = await store.isEnlisted(sensorID);
    if (!isEnlisted) {
      await ensureSensorIsListed(i, sensor)
        .then(result => {
          console.log('OK');
        })
        .catch(error => {
          console.log(`Failed to enlist ${sensorID}, ${error}`);
        });
    }
  }
  console.log('Done');
  process.exit(0);
}

function createSensor(url) {
  return new Promise((resolve, reject) => {
    let stream = request.get(url);
    stream.pipe(csv({ separator: ';' })).on('data', payload => {
      stream.destroy();
      resolve(model.createLuftDatenSensorListing(payload));
    });
  });
}

async function ensureSensorIsListed(i, sensor) {
  return new Promise((resolve, reject) => {
    let sensorID = sensor.metadata.sensorid;
    console.log(`${i + 1}) Ensuring sensor ${sensorID} is listed`);
    store.isEnlisted(sensorID).then(isEnlisted => {
      if (isEnlisted) {
        return resolve(sensorID);
      }

      return registry
        .enlistSensor(sensor)
        .then(sensorID => {
          resolve(sensorID);
        })
        .catch(error => {
          reject(error);
        });
    });
  });
}

enlist();
