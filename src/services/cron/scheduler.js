const schedule = require('node-schedule');
const poller = require('../data/poller');

function registerJobs(jobs) {
  jobs.forEach(job => {
    switch (job.name) {
      case poller.JOB_DEBUG:
        schedule.scheduleJob(job.schedule, poller.pollDebug);
        break;
      case poller.JOB_LUFTDATEN:
        schedule.scheduleJob(job.schedule, poller.pollLuftDaten);
        break;
      case poller.JOB_CITYBIKENYC:
        schedule.scheduleJob(job.schedule, poller.pollCityBikeNyc);
        break;
      default:
        throw new Error(`Unknown job ${job.name}`);
    }
  });
}

module.exports = {
  registerJobs
};
