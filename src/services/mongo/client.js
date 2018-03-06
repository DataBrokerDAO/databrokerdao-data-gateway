const MongoClient = require('mongodb').MongoClient;

const dotenv = require('dotenv');
dotenv.config();

const url = process.env.ATLAS_CONNECTION_STRING;
const dbName = process.env.ATLAS_DATABASE_NAME;

let client;
let db;

async function init() {
  // start up mongodb connections
  await connect();
}

async function connect() {
  if (!client) {
    try {
      client = await MongoClient.connect(url, {
        sslValidate: true
      });
      db = await client.db(dbName);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  return client;
}

async function getDb() {
  if (!db) {
    await connect();
  }

  return db;
}

async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

async function listCollections() {
  const db = await getDb();
  return db.collections();
}

async function createCollection(collectionName) {
  const db = await getDb();
  return db.createCollection(collectionName);
}

module.exports = {
  init,
  getCollection,
  listCollections,
  createCollection
};
