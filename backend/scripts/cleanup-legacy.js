// Finds recipes created by the OLD version of the site (no `visibility` field, ingredients stored as plain
// strings). They don't fit the new data model, never show up in lists, and can confuse queries.
//
//   node scripts/cleanup-legacy.js            -> dry run: only lists what would be deleted
//   node scripts/cleanup-legacy.js --apply    -> deletes them (and their comments/ratings)
//
// Back up first: npm run backup
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../src/database/connectivity.js';
import Recipe from '../src/database/models/Recipe/schema.js';
import Comment from '../src/database/models/Comment/schema.js';
import Rating from '../src/database/models/Recipe/rating.js';

const apply = process.argv.includes('--apply');
await connectDB();
console.log(`Database: ${mongoose.connection.name}${apply ? '  (APPLY)' : '  (dry run)'}`);

// Query the raw collection so Mongoose casting can't hide odd documents
const legacy = await Recipe.collection.find({ visibility: { $exists: false } }, { projection: { name: 1, user: 1, createdAt: 1 } }).toArray();
console.log(`Legacy recipes found: ${legacy.length}`);
for (const r of legacy) console.log(` - ${r._id}  "${r.name}"`);

if (apply && legacy.length) {
  const ids = legacy.map((r) => r._id);
  const [c, rt, rc] = await Promise.all([
    Comment.deleteMany({ recipeId: { $in: ids } }),
    Rating.deleteMany({ recipe: { $in: ids } }),
    Recipe.collection.deleteMany({ _id: { $in: ids } }),
  ]);
  console.log(`Deleted ${rc.deletedCount} recipes, ${c.deletedCount} comments, ${rt.deletedCount} ratings`);
} else if (legacy.length) {
  console.log('\nRe-run with --apply to delete them.');
}
await mongoose.disconnect();
