const Promise = require('bluebird');
const LuftDaten = require('./scrapers/luftdaten');
const CityBikeNyc = require('./scrapers/citybikenyc');
const request = require('request');
const moment = require('moment');
const store = require('../mongo/store');
const lock = require('../util/lock');
const pusher = require('../data/pusher');
const shuffle = require('shuffle-seed');

require('dotenv').config();

/**
 * JOB CONSTANTS
 */
const JOB_DEBUG = 'DEBUG';
const JOB_LUFTDATEN = 'luftdaten';
const JOB_CITYBIKENYC = 'citybikenyc';

async function pollDebug() {
  console.log('Debug poll triggered');
}

async function pollLuftDaten() {
  if (isLocked(JOB_LUFTDATEN)) {
    return Promise.resolve();
  }
  setLock(JOB_LUFTDATEN);

  let syncStart = moment.now();
  let job = await store.getCronJobByName(JOB_LUFTDATEN);
  let outA = { lastKey: job.lastKey };
  let outB = {};

  console.log(`PollLuftDaten starting sync...`);
  let archives =
    process.env.NODE_ENV === 'debug'
      ? ['http://archive.luftdaten.info/2018-03-05/']
      : await LuftDaten.scanForArchives(job.endpoint, outA);

  if (archives.length > 1) {
    archives = archives.slice(-1);
  }

  console.log(`PollLuftDaten ${archives.length} archive(s) need to be scanned`);
  let csvUrls =
    process.env.NODE_ENV === 'debug'
      ? ['http://archive.luftdaten.info/2018-03-05/2018-03-05_bme280_sensor_113.csv']
      : await LuftDaten.scanArchivesForCsvs(archives, outB);

  console.log(`PollLuftDaten ${csvUrls.length} csv(s) need to be synced`);
  csvUrls = shuffle.shuffle(csvUrls, 'imaseed'); // Shuffle here to make data look more randomised/interesting

  // Push data
  let total = csvUrls.length;
  let start = moment.now();
  return Promise.map(
    csvUrls,
    csvUrl => {
      return pusher
        .pushLuftDaten(job, csvUrl)
        .then(() => {
          total--;
          if (total % 100 === 0) {
            let end = moment.now();
            let duration = end - start;
            start = end;
            console.log(`${total} csv(s) left - took ${duration} ms`);
          }
        })
        .catch(error => {
          console.log(`Error in pushLuftDaten: ${error}`);
        });
    },
    { concurrency: parseInt(process.env.CONCURRENCY, 10) }
  ).then(async () => {
    // Update job data  logErrors(job, [outA, outB]);
    job.lastKey = outA.lastKey;
    job.lastSync = moment.now();
    job.duration = job.lastSync - syncStart;
    await store.updateCronJob(job);
    removeLock(JOB_LUFTDATEN);
  });
}

// TODO haven't tested this yet
async function pollCityBikeNyc() {
  if (isLocked(JOB_CITYBIKENYC)) {
    return Promise.resolve();
  }
  setLock(JOB_CITYBIKENYC);

  let start = moment.now();
  let job = await store.getCronJobByName(JOB_CITYBIKENYC);
  let outA = { lastKey: 0 };
  let outB = { lastKey: 0 };

  let stations = await CityBikeNyc.getStations(job.endpoint, outA);
  let statuses = await CityBikeNyc.getStationStatuses(job.endpoint, outB);

  let newLastKey = Math.min(outA.lastKey, outB.lastKey);
  if (job.lastKey >= newLastKey) {
    return Promise.resolve();
  }

  let stationMap = {};
  for (let i = 0; i < stations.data.stations.length; i++) {
    stationMap[stations.data.stations[i].station_id] = stations.data.stations[i];
  }

  return Promise.map(statuses.data.stations, status => {
    return pusher.pushCityBikeNyc(job, stationMap[status.station_id], status);
  }).then(async () => {
    await store.updateCronJob(job);
    removeLock(JOB_CITYBIKENYC);
  });
}

function logErrors(job, logs) {
  if (typeof job.errors === 'undefined') {
    job.errors = [];
  }

  let now = moment.now();
  logs.forEach(log => {
    if (typeof log.error !== 'undefined') {
      job.errors.push([now, log.error]);
    }
  });
}

function isLocked(job) {
  return typeof lock.pollLock[job] !== 'undefined' && lock.pollLock[job] === true;
}

function setLock(job) {
  console.log(`Acquired lock for job ${job}`);
  lock.pollLock[job] = true;
}

function removeLock(job) {
  console.log(`Removing lock for job ${job}`);
  lock.pollLock[job] = false;
}

module.exports = {
  JOB_DEBUG,
  JOB_LUFTDATEN,
  JOB_CITYBIKENYC,
  pollDebug,
  pollLuftDaten,
  pollCityBikeNyc
};
