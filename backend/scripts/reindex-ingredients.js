// Recomputes every recipe's normalized ingredientKeys. Run this after changing the matching rules in
// src/utils/ingredients.js (and once against the live database after deploying this version).
//   node scripts/reindex-ingredients.js
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../src/database/connectivity.js';
import Recipe from '../src/database/models/Recipe/schema.js';
import { normalizeIngredient } from '../src/utils/ingredients.js';

await connectDB();
console.log(`Database: ${mongoose.connection.name}`);
const ops = [];
let changed = 0;
for await (const r of Recipe.find({}).select('ingredients ingredientKeys').lean()) {
  const keys = [...new Set((r.ingredients || []).map((i) => normalizeIngredient(i.name)).filter(Boolean))];
  if (JSON.stringify(keys) !== JSON.stringify(r.ingredientKeys)) {
    changed++;
    ops.push({ updateOne: { filter: { _id: r._id }, update: { $set: { ingredientKeys: keys } } } });
  }
}
if (ops.length) await Recipe.bulkWrite(ops);
console.log(`Reindexed ${changed} recipes`);
await mongoose.disconnect();
