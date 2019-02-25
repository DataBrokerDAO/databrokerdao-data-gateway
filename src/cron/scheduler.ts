import { scheduleJob } from 'node-schedule';
import { getLuftdatenSensors } from '../data/luftdaten';
import Axios from 'axios';
import { DATABROKER_CUSTOM_DAPI_BASE_URL } from '../config/dapi-config';

const luftdatenSchedule = '/5 * * * *';

// TODO: remove all this code?
// function registerJobs(jobs: IJob[]) {
//   jobs.forEach(job => {
//     if (job.environment == NODE_ENV) {
//         switch (job.name) {
//         case JOB_LUFTDATEN:
//           console.log(`Scheduling ${job.name} job at ${job.schedule}`);
//           scheduleJob(job.schedule, pollLuftDaten);
//           beforeAll;
//           break;
//         default:
//         throw new Error(`Unknown job ${job.name}`)
//         }
//     }
//     }
//   });
// }

// export function registerJobs() {
//   console.log(`Scheduling lufdaten job at ${luftdatenSchedule}`);
//   scheduleJob(luftdatenSchedule, pollLuftDaten);
// }

// export async function pollLuftDaten() {
//   console.log('Polling ludaten sensor data');
//   const data = getLuftdatenSensors();

//   Axios.post(`${DATABROKER_CUSTOM_DAPI_BASE_URL}sensorData/45`, data);
// }
