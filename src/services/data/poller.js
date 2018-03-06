const Promise = require('bluebird');
const LuftDaten = require('./scrapers/luftdaten');
const CityBikeNyc = require('./scrapers/citybikenyc');
const request = require('request');
const moment = require('moment');
const store = require('../mongo/store');
const pusher = require('../data/pusher');

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
  let job = await store.getCronJobByName(JOB_LUFTDATEN);
  let outA = { lastKey: job.lastKey };
  let archives = ['http://archive.luftdaten.info/2015-10-01/']; // await LuftDaten.scanForArchives(job.endpoint, outA);
  let csvUrls = await LuftDaten.scanArchivesForCsvs(archivesToSync, outB);

  // Update job data
  logErrors(job, [outA, outB]);
  job.lastKey = out.lastKey;
  job.lastSync = moment.now();
  store.updateCronJob(job);

  // Push data
  csvUrls.forEach(csvUrl => {
    pusher.push(job, csvUrl);
  });
}

async function pollCityBikeNyc() {
  let job = await store.getCronJobByName(JOB_CITYBIKENYC);
  let out = { lastKey: job.lastKey };
  let feed = await CityBikeNyc.get
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

module.exports = {
  JOB_DEBUG,
  JOB_LUFTDATEN,
  JOB_CITYBIKENYC,
  pollDebug,
  pollLuftDaten,
  pollCityBikeNyc
};
