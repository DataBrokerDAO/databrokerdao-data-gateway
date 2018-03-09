const Promise = require('bluebird');
const LuftDaten = require('./scrapers/luftdaten');
const CityBikeNyc = require('./scrapers/citybikenyc');
const request = require('request');
const moment = require('moment');
const store = require('../mongo/store');
const lock = require('../util/lock');
const pusher = require('../data/pusher');
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

  let start = moment.now();
  let job = await store.getCronJobByName(JOB_LUFTDATEN);
  let outA = { lastKey: job.lastKey };
  let outB = {};

  console.log(`PollLuftDaten starting sync...`);
  let archives =
    process.env.NODE_ENV === 'debug'
      ? ['http://archive.luftdaten.info/2018-03-05/']
      : await LuftDaten.scanForArchives(job.endpoint, outA);

  console.log(`PollLuftDaten ${archives.length} archive(s) need to be scanned`);
  let csvUrls =
    process.env.NODE_ENV === 'debug'
      ? ['http://archive.luftdaten.info/2018-03-05/2018-03-05_bme280_sensor_113.csv']
      : await LuftDaten.scanArchivesForCsvs(archives, outB);

  console.log(`PollLuftDaten ${csvUrls.length} csv(s) need to be synced`);

  // Update job data  logErrors(job, [outA, outB]);
  job.lastKey = outA.lastKey;
  job.lastSync = moment.now();
  job.duration = job.lastSync - start;

  // Push data
  let total = csvUrls.length;
  return Promise.map(
    csvUrls,
    csvUrl => {
      return pusher.pushLuftDaten(job, csvUrl).then(() => {
        total--;
        if (total % 100 === 0) {
          console.log(`${total} csv(s) left`);
        }
      });
    },
    { concurrency: parseInt(process.env.CONCURRENCY, 10) }
  ).then(async () => {
    await store.updateCronJob(job);
    removeLock(JOB_LUFTDATEN);
  });
}

// TODO haven't tested this yet
async function pollCityBikeNyc() {
  let job = await store.getCronJobByName(JOB_CITYBIKENYC);
  let out = { lastKey: job.lastKey };
  let feed = await CityBikeNyc.getStationStatusFeed(job, out);
  pusher.push(job, feed);
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
  console.log(`Acquiring lock for job ${job}`);
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
