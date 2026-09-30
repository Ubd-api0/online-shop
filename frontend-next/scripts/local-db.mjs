// Local development MongoDB, no install/Docker/admin rights required.
// Downloads a portable `mongod` binary on first run (cached under
// node_modules/.cache afterwards) and persists data to .data/mongodb so it
// survives restarts. Run with `npm run db:local`, keep it running alongside
// `npm run dev`, and point DB_URL at the printed connection string.
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", ".data", "mongodb");

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 27017,
    dbPath,
    dbName: "shop_db",
    storageEngine: "wiredTiger",
  },
});

console.log(`Local MongoDB running at: ${mongod.getUri()}shop_db`);
console.log("Data persisted at:", dbPath);
console.log("Press Ctrl+C to stop.");

process.on("SIGINT", async () => {
  await mongod.stop();
  process.exit(0);
});
