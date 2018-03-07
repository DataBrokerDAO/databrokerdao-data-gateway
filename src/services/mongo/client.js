const MongoClient = require('mongodb').MongoClient;

// Env constants
require('dotenv').config();
const url = process.env.ATLAS_CONNECTION_STRING;
const DB_DATAGATEWAY = process.env.ATLAS_DATABASE_NAME_DATAGATEWAY;
const DB_DATABROKER_DAPI = process.env.ATLAS_DATABASE_NAME_DATABROKER_DAPI;

let client;
async function connect() {
  if (!client) {
    try {
      client = await MongoClient.connect(url, {
        sslValidate: true
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  return client;
}

async function getDb(name) {
  if (!client) {
    await connect();
  }

  return client.db(name);
}

async function getCollection(collectionName, dbName) {
  dbName = typeof dbName !== 'undefined' ? dbName : DB_DATAGATEWAY;
  const db = await getDb(dbName);
  return db.collection(collectionName);
}

module.exports = {
  getCollection,
  DB_DATAGATEWAY,
  DB_DATABROKER_DAPI
};
