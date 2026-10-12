// Seeds the database with recipes from TheMealDB (https://www.themealdb.com/api.php).
//
//   node scripts/seed.js            -> replace previously seeded recipes only
//   node scripts/seed.js --wipe     -> ALSO delete every user-made recipe, comment and rating
//                                      (run `node scripts/backup.js` first)
//
// Note: TheMealDB's free key "1" is intended for development/education. For a public production
// site, support the project (their site explains the supporter key) and set MEALDB_KEY in .env.
import 'dotenv/config';
import crypto from 'crypto';
import mongoose from 'mongoose';
import connectDB from '../src/database/connectivity.js';
import Recipe from '../src/database/models/Recipe/schema.js';
import Rating from '../src/database/models/Recipe/rating.js';
import Comment from '../src/database/models/Comment/schema.js';
import User from '../src/database/models/User/user.js';

const KEY = process.env.MEALDB_KEY || '1';
const BASE = `https://www.themealdb.com/api/json/v1/${KEY}`;
const wipe = process.argv.includes('--wipe');

const get = async (path, tries = 3) => {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${BASE}/${path}`, { signal: AbortSignal.timeout(20000) });
      if (res.ok) return await res.json();
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw new Error(`Failed to fetch ${path}`);
};

const hostOf = (u) => {
  try {
    return new URL(u).hostname.replace(/^www./, '');
  } catch {
    return 'Original source';
  }
};

const toDirections = (text = '') => {
  let lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^step\s*\d+\s*$/i.test(l) && !/^\d+[.)]?$/.test(l))
    .map((l) => l.replace(/^(step\s*)?\d+[.):-]\s*/i, ''));
  // One big paragraph: split into sentences and group them into steps of ~2 sentences.
  if (lines.length <= 2 && lines.join(' ').length > 400) {
    const sentences = lines.join(' ').match(/[^.!?]+[.!?]+(\s|$)/g) || lines;
    lines = [];
    for (let i = 0; i < sentences.length; i += 2) lines.push(sentences.slice(i, i + 2).join('').trim());
  }
  return lines.map((l) => l.slice(0, 1900)).filter(Boolean);
};

const toRecipe = (m, userId) => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = (m[`strIngredient${i}`] || '').trim();
    if (name) ingredients.push({ name, amount: (m[`strMeasure${i}`] || '').trim() });
  }
  const cuisine = m.strArea || m.strCountry || undefined;
  const category = m.strCategory || undefined;
  const diets = category === 'Vegan' ? ['vegetarian', 'vegan'] : category === 'Vegetarian' ? ['vegetarian'] : [];
  const main = ingredients.slice(0, 3).map((i) => i.name.toLowerCase());
  const description = [
    cuisine && cuisine !== 'Unknown' ? `A ${cuisine}` : 'A',
    category ? ` ${category.toLowerCase()} dish` : ' dish',
    main.length ? ` made with ${main.join(', ')}` : '',
    '.',
  ].join('');
  return {
    user: userId,
    name: m.strMeal.trim().slice(0, 140),
    description,
    ingredients,
    directions: toDirections(m.strInstructions),
    image: m.strMealThumb,
    category,
    cuisine: cuisine && cuisine !== 'Unknown' ? cuisine : undefined,
    diets,
    tags: (m.strTags || '').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10),
    visibility: 'public',
    source: m.strSource ? { name: hostOf(m.strSource), url: m.strSource } : { name: 'TheMealDB', url: `https://www.themealdb.com/meal/${m.idMeal}` },
    isSeed: true,
  };
};

await connectDB();

// A non-loginable account that owns the starter recipes.
let kitchen = await User.findOne({ username: 'FamFeast' });
if (!kitchen) {
  kitchen = await User.create({
    username: 'FamFeast',
    email: 'kitchen@famfeast.invalid',
    password: crypto.randomBytes(32).toString('hex'),
    bio: 'Starter recipes curated for you. Add your own and build your family cookbook!',
  });
}

if (wipe) {
  const [r, c, rt] = await Promise.all([Recipe.deleteMany({}), Comment.deleteMany({}), Rating.deleteMany({})]);
  await User.updateMany({}, { $set: { savedRecipes: [] } });
  console.log(`Wiped ${r.deletedCount} recipes, ${c.deletedCount} comments, ${rt.deletedCount} ratings`);
} else {
  const r = await Recipe.deleteMany({ isSeed: true });
  console.log(`Removed ${r.deletedCount} previously seeded recipes`);
}

const meals = new Map();
for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
  const data = await get(`search.php?f=${letter}`);
  for (const m of data.meals || []) meals.set(m.idMeal, m);
  process.stdout.write(`${letter}:${meals.size} `);
}
console.log(`\nFetched ${meals.size} meals`);

const docs = [];
for (const m of meals.values()) {
  const doc = toRecipe(m, kitchen._id);
  if (doc.ingredients.length && doc.directions.length && doc.image) docs.push(doc);
}
// create() (not insertMany) so the pre-validate hook fills ingredientKeys
let ok = 0;
for (const doc of docs) {
  try {
    await Recipe.create(doc);
    ok++;
  } catch (e) {
    console.warn(`Skipped "${doc.name}": ${e.message}`);
  }
}
console.log(`Inserted ${ok}/${docs.length} recipes`);
await mongoose.disconnect();
