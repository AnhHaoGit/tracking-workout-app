import { MongoClient } from "mongodb";
import { MONGODB_URI } from "../constants/constants";

const client = new MongoClient(MONGODB_URI);
let db: ReturnType<typeof client.db> | null = null;

export const connectToDatabase = async () => {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGODB_NAME);
  }
  return db;
};
