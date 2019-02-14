import {DatabaseSensor} from '../model/databaseSensor';
import {MongoClient} from 'mongodb';

const globalAny:any = global;

export function accessDb() {

// Connect using MongoClient
MongoClient.connect(process.env.MONGO_DB_URL, (err, client) => {
    // Create a collection we want to drop later
    const col = client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_DB_SENSOR_COLLECTION);

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
        MongoClient.connect(process.env.MONGO_DB_URL , (err, client) => {
            // Create a collection we want to drop later
            const col = client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_DB_SENSOR_COLLECTION);
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
    MongoClient.connect(process.env.MONGO_DB_URL, (err, client) => {
        const col = client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_DB_SENSOR_COLLECTION);
    
        col.countDocuments()
        .then((result) => { 
            if (result < 1) {
                console.log('Database appears to be empty, attempting to fill');
                MongoClient.connect(process.env.MONGO_DB_URL, (err, client) => {
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
