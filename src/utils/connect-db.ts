import { MongoClient } from "mongodb";
import { MONGODB_URI } from "../constants/constants";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

const MONGODB_NAME = process.env.MONGODB_NAME;
if (!MONGODB_NAME) {
  throw new Error("Missing MONGODB_NAME environment variable");
}

const client = new MongoClient(MONGODB_URI);

let connectionPromise: ReturnType<typeof client.db> extends never
  ? never
  : Promise<ReturnType<typeof client.db>> | null = null;

export const connectToDatabase = async () => {
  if (!connectionPromise) {
    connectionPromise = client
      .connect()
      .then(() => client.db(MONGODB_NAME))
      .catch((error) => {
        connectionPromise = null;
        console.error("Failed to connect to MongoDB:", error);
        throw new Error("Database connection failed");
      });
  }

  return connectionPromise;
};
