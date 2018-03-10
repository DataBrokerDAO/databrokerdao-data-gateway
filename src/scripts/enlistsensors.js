const model = require('../services/model/sensor');
const store = require('../services/mongo/store');
const registry = require('../services/databroker/registry');
const request = require('request');
const csv = require('csv-parser');

const sensorUrlList = [
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8746.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8766.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8776.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8778.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8784.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8782.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8788.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8790.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8794.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8800.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8802.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8804.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8806.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8808.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8810.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8814.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8818.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8822.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8824.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8826.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8830.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8838.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8840.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8842.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8858.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8951.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_8994.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9556.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9562.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9564.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9566.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9568.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9590.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9594.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9606.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9610.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9614.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9612.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9622.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9620.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9624.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9626.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9634.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9632.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9638.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9644.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9754.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9802.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_dht22_sensor_9826.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_6561.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8745.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8765.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8775.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8777.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8781.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8783.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8787.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8789.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8793.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8799.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8801.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8803.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8805.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8807.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8809.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8813.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8817.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8821.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8823.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8825.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8829.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8837.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8839.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8841.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8857.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8950.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_8993.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9555.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9561.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9563.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9565.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9567.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9585.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9589.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9593.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9605.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9609.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9611.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9613.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9619.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9621.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9623.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9625.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9631.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9633.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9637.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9643.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9753.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9801.csv',
  'http://archive.luftdaten.info/2018-03-09/2018-03-09_sds011_sensor_9825.csv'
];

async function enlist() {
  for (let i = 0; i < sensorUrlList.length; i++) {
    let sensor = await createSensor(sensorUrlList[i]);
    await ensureSensorIsListed(sensor);
  }
  console.log('Done');
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

async function ensureSensorIsListed(sensor) {
  return new Promise((resolve, reject) => {
    let sensorID = sensor.metadata.sensorid;
    console.log(`Ensuring sensor ${sensorID} is listed`);
    store.isEnlisted(sensorID).then(isEnlisted => {
      if (isEnlisted) {
        return resolve();
      }

      registry.enlistSensor(sensor).then(sensorID => {
        resolve(sensorID);
      });
    });
  });
}

enlist();
