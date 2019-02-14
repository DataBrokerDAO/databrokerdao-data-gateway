import {DatabaseSensor} from '../model/databaseSensor';
import {MongoClient} from 'mongodb';
import { array } from 'joi';

// Connection url
const url = 'mongodb://192.168.99.102:27017';

const globalAny:any = global;

// Database Name
const dbName = 'local';

export function accessDb() {

// Connect using MongoClient
MongoClient.connect(url, (err, client) => {
    // Create a collection we want to drop later
    const col = client.db(dbName).collection('test');

    let request1 = col.find().toArray()
        .then((result) => { 
            console.log(result);
            client.close();
        });

        let request2 = col.stats()
        .then((result) => { 
            console.log(result);
            client.close();
        });
    

  });

}

export function compareSensors(sensorData: any) {
    if (!globalAny.databaseIsInititialized) {
        initializeDatabase(sensorData);

    } else {
    // Connect using MongoClient
        MongoClient.connect(url , (err, client) => {
            // Create a collection we want to drop later
            const col = client.db(dbName).collection('sensors');
            let newSensorArray= [];
            col.find().toArray()
            .then((result) => { 
                sensorData.data.forEach((sensor:any, index: number) => {
                    result.forEach(dbSensor => {
                        if(dbSensor)
                    });
                    console.log(sensor);
                    let newSensor = new DatabaseSensor(sensor.id, sensor);
                });
                //console.log(result);
                client.close();
            });
        
          });
        
        }

}

function initializeDatabase (sensorData: any) {
    MongoClient.connect(url, (err, client) => {
        const col = client.db(dbName).collection('sensors');
    
        col.countDocuments()
        .then((result) => { 
            if (result < 1) {
                console.log('Database appears to be empty, attempting to fill');
                MongoClient.connect(url, (err, client) => {
                    let newSensorArray: DatabaseSensor[] = [];
                    
                    sensorData.data.forEach((sensor: any, index: number) => {
                        //if(index < 10) {
                            let newSensor = new DatabaseSensor(sensor.sensor.id, sensor.sensor.sensor_type.name, sensor.location.latitude, sensor.location.longitude);
                            newSensorArray.push(newSensor);
                            //console.log(sensor);
                        //}
                    });
                    console.log(newSensorArray.length);
    
                    col.insertMany(newSensorArray);
    
                    client.close();
                    console.log('Database initialized')
                });
            }
            
        });
    });
}

module.exports = {
    accessDb,
    compareSensors
}
