// Dumps every collection to backups/<timestamp>/<collection>.json
import connectDB from '../src/database/connectivity.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

await connectDB();
const dir = path.join('backups', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(dir, { recursive: true });
for (const { name } of await mongoose.connection.db.listCollections().toArray()) {
  const docs = await mongoose.connection.db.collection(name).find().toArray();
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(docs, null, 2));
  console.log(`${name}: ${docs.length} docs`);
}
console.log('Backup written to', dir);
await mongoose.disconnect();
