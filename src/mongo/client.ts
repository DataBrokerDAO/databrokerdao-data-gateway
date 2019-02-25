import { MongoClient } from 'mongodb';
import { MONGO_DB_URL, MONGO_DB_NAME } from '../config/dapi-config';

let client: MongoClient;
async function connect() {
  if (!client) {
    try {
      client = await MongoClient.connect(MONGO_DB_URL, {
        sslValidate: true,
      });
    } catch (error) {
      throw error;
    }
  }

  return client;
}

async function getDb(name: string) {
  if (!client) {
    await connect();
  }

  return client.db(name);
}

export async function getCollection(collectionName: string) {
  const db = await getDb(MONGO_DB_NAME);
  return db.collection(collectionName);
}
