import { MongoClient } from 'mongodb';
import { ISensor, ISensorEnlist } from '../types';
import { MONGO_DB_URL } from '../config/dapi-config';
import {
  MONGO_DB_URL,
  MONGO_DB_NAME,
  MONGO_DB_SENSOR_COLLECTION,
} from '../config/dapi-config';

export async function enlistDbSensors(sensors: ISensor[]) {
  MongoClient.connect(MONGO_DB_URL, (err, client) => {
    if (err) {
      console.error('Failed to connect to database with error', err);
    } else {
      const col = client
        .db(MONGO_DB_NAME)
        .collection(MONGO_DB_SENSOR_COLLECTION);

      col.insertMany(sensors).then(() => {
        client.close();
      });
    }
  });
}

export async function enlistDbSensor(sensor: ISensorEnlist) {
  MongoClient.connect(MONGO_DB_URL, (err, client) => {
    if (err) {
      console.error('Failed to connect to database with error', err);
    } else {
      const col = client
        .db(MONGO_DB_NAME)
        .collection(MONGO_DB_SENSOR_COLLECTION);
      col
        .updateOne(
          { id: sensor.metadata.sensorid },
          { $set: { id: sensor.metadata.sensorid, enlisted: true } },
          { upsert: true }
        )
        .then(() => {
          client.close();
        });
    }
  });
}

// TODO: Clear this crap
// export async function updateDbSensors() {
//   const sensorData = await getLuftdatenSensors();
//   if (sensorData != null || sensorData !== undefined) {
//     globalAny.sensorData = sensorData;
//   }
//   await compareSensors(sensorData);
// }

// export function accessDb() {
//   // Connect using MongoClient
//   MongoClient.connect(process.env.MONGO_DB_URL, (err, client) => {
//     // Create a collection we want to drop later
//     const col = client
//       .db(process.env.MONGO_DB_NAME)
//       .collection(process.env.MONGO_DB_SENSOR_COLLECTION);

//     let request1 = col
//       .find()
//       .toArray()
//       .then(result => {
//         console.log(result);
//         client.close();
//       });

//     let request2 = col.stats().then(result => {
//       console.log(result);
//       client.close();
//     });
//   });
// }

// export function compareSensors(sensorData: any) {
//   if (!globalAny.databaseIsInititialized) {
//     initializeDatabase(sensorData);
//   } else {
//     try {
//       // Connect using MongoClient
//       MongoClient.connect(process.env.MONGO_DB_URL, (err, client) => {
//         // Create a collection we want to drop later
//         const col = client
//           .db(process.env.MONGO_DB_NAME)
//           .collection(process.env.MONGO_DB_SENSOR_COLLECTION);
//         let newSensorArray: ISensor[] = [];
//         col
//           .find()
//           .toArray()
//           .then(result => {
//             for (let index = 0; index < sensorData.data.length; index++) {
//               let sensor = sensorData.data[index];

//               for (let dbIndex = 0; dbIndex < result.length; dbIndex++) {
//                 let dbSensor = result[dbIndex];
//               }
//             }
//             client.close();
//           });
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   }
// }

// function initializeDatabase(sensorData: any) {
//   MongoClient.connect(process.env.MONGO_DB_URL, (err, client) => {
//     const col = client
//       .db(process.env.MONGO_DB_NAME)
//       .collection(process.env.MONGO_DB_SENSOR_COLLECTION);

//     col.countDocuments().then(result => {
//       if (result < 1) {
//         console.log('Database appears to be empty, attempting to fill');
//         // TODO: extract connection logic
//         MongoClient.connect(process.env.MONGO_DB_URL, (err, client) => {
//           //TODO: fix import
//           let newSensorArray: ISensor[] = [];
//           for (let index = 0; index < sensorData.data.length; index++) {
//             let sensor = sensorData.data[index];
//             let newSensor = { id: sensor.sensor.id, enlisted: false };
//             newSensorArray.push(newSensor);
//           }

//           col.insertMany(newSensorArray);

//           client.close();
//           console.log('Database initialized');
//         });
//       }
//     });
//   });
// }
