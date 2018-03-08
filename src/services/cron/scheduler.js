const schedule = require('node-schedule');
const poller = require('../data/poller');

function registerJobs(jobs) {
  jobs.forEach(job => {
    switch (job.name) {
      case poller.JOB_DEBUG:
        console.log(`Scheduling ${poller.JOB_DEBUG} job at ${job.schedule}`);
        schedule.scheduleJob(job.schedule, poller.pollDebug);
        break;
      case poller.JOB_LUFTDATEN:
        console.log(`Scheduling ${poller.JOB_LUFTDATEN} job at ${job.schedule}`);
        schedule.scheduleJob(job.schedule, poller.pollLuftDaten);
        break;
      case poller.JOB_CITYBIKENYC:
        console.log(`Scheduling ${poller.JOB_CITYBIKENYC} job at ${job.schedule}`);
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
