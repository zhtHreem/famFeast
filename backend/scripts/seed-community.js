// Adds SAMPLE community activity (members, follows, ratings, saves, comments) so a fresh install
// feels alive while you build and demo it.
//
//   node scripts/seed-community.js           -> (re)create the sample community
//   node scripts/seed-community.js --remove  -> delete all of it and restore the original recipe owners
//
// Everything is flagged isDemo and is fake: never show it to real visitors as genuine reviews.
// For safety this refuses to run against the live database ("FamFest") unless you pass --i-know-this-is-live.
import 'dotenv/config';
import crypto from 'crypto';
import mongoose from 'mongoose';
import connectDB from '../src/database/connectivity.js';
import Recipe from '../src/database/models/Recipe/schema.js';
import Rating from '../src/database/models/Recipe/rating.js';
import Comment from '../src/database/models/Comment/schema.js';
import User from '../src/database/models/User/user.js';

const remove = process.argv.includes('--remove');

// Deterministic randomness so reruns produce the same community.
let seed = 20261012;
const rand = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const sample = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
};
const DAY = 24 * 3600 * 1000;
const daysAgo = (min, max) => new Date(Date.now() - (min + rand() * (max - min)) * DAY);

const MEMBERS = [
  ['amina_cooks', 'Weeknight cook, weekend baker. Mum of three hungry boys.'],
  ['chef_bilal', 'Biryani is a personality, not a dish.'],
  ['nani_ki_rasoi', "Recipes from my grandmother's kitchen, written down before I forget them."],
  ['sara.bakes', 'Cakes, cookies and anything with cardamom.'],
  ['zayn_eats', 'Cooking my way through every cuisine, one Sunday at a time.'],
  ['meera_homecook', 'South Indian home cooking. Filter coffee required.'],
  ['tom_on_the_grill', 'If it can be grilled, I will grill it.'],
  ['lena_plantbased', 'Plant-based, low-waste, big flavour.'],
  ['omar_spiceroute', 'Collecting spices and stories from the Middle East to Morocco.'],
  ['priya_quickmeals', '30 minutes or less. Busy people welcome.'],
  ['hassan_kebabs', 'Street food at home. Charcoal optional.'],
  ['julia_pastry', 'Pastry nerd. Butter is always the answer.'],
  ['kenji_homestyle', 'Simple Japanese home meals and too many ramen bowls.'],
  ['farah_kitchen', 'Family feasts, Eid tables and everything in between.'],
];

// Comments are composed from the recipe itself (its real ingredients, category and name) so they read
// like a cook talking about THAT dish. Nothing here claims something that can't be true for the recipe.
const MEAT = new Set(['Chicken', 'Beef', 'Lamb', 'Pork', 'Goat', 'Seafood']);
const PLANT_ONLY = new Set(['lena_plantbased']);

const FLAVOUR = ['garlic', 'ginger', 'lemon', 'lime', 'cumin', 'coriander', 'chili', 'honey', 'cinnamon', 'cardamom', 'butter', 'cheese', 'parmesan', 'tomato', 'basil', 'thyme', 'mint', 'chocolate', 'vanilla', 'coconut milk', 'soy sauce', 'paprika', 'turmeric', 'onion', 'mustard', 'orange', 'almond', 'walnut', 'peanut butter', 'yogurt', 'cream'];
const SWAPS = { butter: 'ghee', milk: 'oat milk', 'sour cream': 'Greek yogurt', cream: 'coconut cream', sugar: 'honey', 'soy sauce': 'tamari', chicken: 'turkey', 'ground beef': 'lamb mince', rice: 'quinoa', parsley: 'coriander', 'olive oil': 'vegetable oil', yogurt: 'sour cream', lemon: 'lime', honey: 'maple syrup', onion: 'shallots' };

const BAKED = /cake|bread|cookie|brownie|pie\b|tart|muffin|scone|loaf|pudding|crumble|cheesecake|pastry|bun\b|roll|biscuit|gingerbread|flapjack|crumpet|pancake/i;
const SAUCY = /stew|curry|soup|casserole|chili|chilli|ragu|sauce|braise|stroganoff|goulash|dal\b|daal|stock|broth|gravy/i;
const OPINIONS = [
  'Family approved. Will be making this again.',
  'Easy to follow, even on a busy evening.',
  'Saved this for next week already.',
  'Exactly what I was in the mood for.',
  'Looks just like the photo, which never happens.',
  'Great recipe, thanks for sharing.',
  'Made it twice this month. That says it all.',
  'Clear steps and it turned out well first time.',
];

const kind = (r) => (r.category === 'Dessert' ? 'sweet' : r.category === 'Breakfast' ? 'breakfast' : r.category === 'Side' ? 'side' : r.category === 'Starter' ? 'starter' : 'main');

const composeComment = (r) => {
  const ings = (r.ingredients || []).map((i) => i.name);
  const keys = r.ingredientKeys || [];
  const k = kind(r);
  const options = [() => pick(OPINIONS)];
  const flav = keys.find((key) => FLAVOUR.includes(key));
  if (flav) {
    const shown = flav;
    options.push(() => `The ${shown} really carries this one. Don't skimp on it.`);
    options.push(() => `Loved the ${shown} here, such a good combination.`);
  }
  const swapKey = keys.find((key) => SWAPS[key]);
  if (swapKey) options.push(() => `I swapped the ${swapKey} for ${SWAPS[swapKey]} because that's what I had, and it still worked.`);
  if (r.name.length <= 38 && rand() < 0.4) options.push(() => `Made the ${r.name.toLowerCase()} for Sunday lunch and nobody left anything on the plate.`);

  if (k === 'sweet') {
    options.push(() => 'Lovely with a cup of tea.', () => 'Brought it to a family get-together and the plate came back empty.', () => 'Not overly sweet, which is just how I like it.');
    if (BAKED.test(r.name)) options.push(() => 'My oven runs hot so I checked it five minutes early. Worth keeping an eye on.', () => 'Let it cool properly before cutting, it holds together so much better.');
  } else if (k === 'main') {
    options.push(() => 'Made a double batch and had leftovers for lunch the next day.', () => 'Good for a weeknight, everything was easy to get on the table.', () => 'Finished with a squeeze of lemon and it lifted the whole dish.', () => 'Even my fussy eater cleaned the plate.', () => 'Took a little longer than I expected, but worth the effort.');
    if (/curry|stew|kebab|fry|stir|chilli|chili|tikka|masala|korma/i.test(r.name) && !keys.includes('rice')) options.push(() => 'Served it with plain rice and a simple salad.', () => 'Great with warm flatbread to mop up the sauce.');
    if (SAUCY.test(r.name)) options.push(() => 'I let it simmer a bit longer for a thicker sauce and it was even better.', () => 'Tastes better the next day, as stews usually do.');
  } else if (k === 'side') {
    options.push(() => 'Made it to go with grilled chicken and it disappeared first.', () => 'Good make-ahead side, I prepped it in the morning.', () => 'Brought it to a barbecue and people kept asking what was in it.', () => 'Simple, but it rounded off the whole meal nicely.');
  } else if (k === 'breakfast') {
    options.push(() => 'Perfect for a slow weekend morning.', () => 'Quick enough that I can manage it before work.');
  } else if (k === 'starter') {
    options.push(() => 'Made these as a starter for guests and they went down well.');
  }
  let text = pick(options)();
  if (rand() < 0.28) {
    const second = pick(options)();
    if (second !== text) text = `${text} ${second}`;
  }
  return text;
};

const OWNER_REPLIES = [
  'Thank you so much, so glad you enjoyed it!',
  'Thanks for trying it! Hope it becomes a regular for you.',
  'That is such kind feedback, thank you.',
  'Appreciate you taking the time to leave this.',
  'Happy it worked out for you! Let me know if you try any variations.',
  'Thank you! It is one of our favourites too.',
];

const randomPassword = () => crypto.randomBytes(24).toString('hex');

const recomputeStats = async () => {
  const [ratings, saves] = await Promise.all([
    Rating.aggregate([{ $group: { _id: '$recipe', avg: { $avg: '$value' }, count: { $sum: 1 } } }]),
    User.aggregate([{ $unwind: '$savedRecipes' }, { $group: { _id: '$savedRecipes', count: { $sum: 1 } } }]),
  ]);
  await Recipe.updateMany({}, { $set: { ratingAvg: 0, ratingCount: 0, saveCount: 0 } });
  const ops = [];
  for (const r of ratings) ops.push({ updateOne: { filter: { _id: r._id }, update: { $set: { ratingAvg: Math.round(r.avg * 10) / 10, ratingCount: r.count } } } });
  for (const s of saves) ops.push({ updateOne: { filter: { _id: s._id }, update: { $set: { saveCount: s.count } } } });
  if (ops.length) await Recipe.bulkWrite(ops);
};

await connectDB();
const dbName = mongoose.connection.name;
console.log(`Database: ${dbName}`);
if (dbName === 'FamFest' && !process.argv.includes('--i-know-this-is-live')) {
  console.error('Refusing to run against the live database "FamFest". Set MONGO_DB_NAME=FamFest_dev (or pass --i-know-this-is-live).');
  process.exit(1);
}

const kitchen = await User.findOne({ username: 'FamFeast' });
if (!kitchen) {
  console.error('Run `npm run seed` first (the FamFeast starter account is missing).');
  process.exit(1);
}

// ---- Remove any previous sample community ---------------------------------
const demoUsers = await User.find({ isDemo: true }).select('_id');
const demoIds = demoUsers.map((u) => u._id);
if (demoIds.length) {
  await Promise.all([
    Comment.deleteMany({ $or: [{ isDemo: true }, { user: { $in: demoIds } }] }),
    Rating.deleteMany({ user: { $in: demoIds } }),
    Recipe.updateMany({ user: { $in: demoIds } }, { $set: { user: kitchen._id } }),
  ]);
  await User.updateMany({}, { $pull: { followers: { $in: demoIds }, following: { $in: demoIds } } });
  await User.deleteMany({ _id: { $in: demoIds } });
  await recomputeStats();
  console.log(`Removed ${demoIds.length} sample members and their activity`);
}
if (remove) {
  await mongoose.disconnect();
  process.exit(0);
}

// ---- Members ---------------------------------------------------------------
// create() runs the password-hashing hook, so each account gets a valid (but unknown) bcrypt hash
const members = [];
for (const [username, bio] of MEMBERS) {
  members.push(await User.create({ username, email: `${username.replace(/[^a-z0-9]/gi, '')}@demo.famfeast.invalid`, password: randomPassword(), bio, isDemo: true }));
}
await Promise.all(members.map((m) => User.collection.updateOne({ _id: m._id }, { $set: { createdAt: daysAgo(20, 160) } })));
const memberIds = members.map((m) => m._id);
console.log(`Created ${members.length} sample members`);

// ---- Recipe ownership: spread seeded recipes across members ----------------
const seeded = await Recipe.find({ isSeed: true }).select('_id name category user ingredients ingredientKeys').lean();
const ownership = new Map();
const own = [];
for (const r of seeded) {
  const owner = rand() < 0.72 ? pick(memberIds) : kitchen._id;
  ownership.set(String(r._id), owner);
  own.push({ updateOne: { filter: { _id: r._id }, update: { $set: { user: owner } } } });
}
if (own.length) await Recipe.bulkWrite(own);
console.log(`Assigned ${seeded.length} recipes to members`);

// ---- Follows ----------------------------------------------------------------
const follow = new Map(memberIds.map((id) => [String(id), new Set()]));
const followedBy = new Map([...memberIds, kitchen._id].map((id) => [String(id), new Set()]));
for (const id of memberIds) {
  const targets = sample([...memberIds.filter((x) => String(x) !== String(id)), kitchen._id, kitchen._id], 4 + Math.floor(rand() * 6));
  for (const t of targets) {
    follow.get(String(id)).add(String(t));
    followedBy.get(String(t)).add(String(id));
  }
}
const toIds = (set) => [...set].map((s) => new mongoose.Types.ObjectId(s));
await User.bulkWrite([
  ...memberIds.map((id) => ({ updateOne: { filter: { _id: id }, update: { $set: { following: toIds(follow.get(String(id))), followers: toIds(followedBy.get(String(id))) } } } })),
  { updateOne: { filter: { _id: kitchen._id }, update: { $set: { followers: toIds(followedBy.get(String(kitchen._id))) } } } },
]);
console.log('Created follows');

// ---- Ratings ---------------------------------------------------------------
const ratingValue = () => {
  const r = rand();
  return r < 0.45 ? 5 : r < 0.8 ? 4 : r < 0.94 ? 3 : r < 0.98 ? 2 : 1;
};
const ratingDocs = [];
for (const r of seeded) {
  if (rand() > 0.62) continue;
  const n = 1 + Math.floor(Math.pow(rand(), 2) * 8);
  const owner = String(ownership.get(String(r._id)));
  const eligible = members.filter((m) => String(m._id) !== owner && !(PLANT_ONLY.has(m.username) && MEAT.has(r.category)));
  for (const uid of sample(eligible.map((m) => m._id), n)) {
    ratingDocs.push({ recipe: r._id, user: uid, value: ratingValue(), createdAt: daysAgo(1, 70), updatedAt: new Date() });
  }
}
if (ratingDocs.length) await Rating.insertMany(ratingDocs, { ordered: false });
console.log(`Created ${ratingDocs.length} ratings`);

// ---- Saves -----------------------------------------------------------------
const rated = [...new Set(ratingDocs.map((d) => String(d.recipe)))];
for (const id of memberIds) {
  const picks = sample(rated.length > 40 ? rated : seeded.map((s) => String(s._id)), 8 + Math.floor(rand() * 18));
  await User.updateOne({ _id: id }, { $set: { savedRecipes: picks.map((p) => new mongoose.Types.ObjectId(p)) } });
}
await recomputeStats();
console.log('Updated ratings and saves');

// ---- Comments + owner replies ----------------------------------------------
const comments = [];
for (const r of seeded) {
  if (rand() > 0.4) continue;
  const owner = ownership.get(String(r._id));
  const ownerMember = members.find((m) => String(m._id) === String(owner));
  const count = 1 + Math.floor(Math.pow(rand(), 2) * 4);
  const commenters = sample(members.filter((m) => String(m._id) !== String(owner) && !(PLANT_ONLY.has(m.username) && MEAT.has(r.category))), count);
  for (const who of commenters) {
    const createdAt = daysAgo(0.2, 70);
    const replies = [];
    if (ownerMember && rand() < 0.45) {
      replies.push({ user: ownerMember._id, name: ownerMember.username, text: pick(OWNER_REPLIES), createdAt: new Date(createdAt.getTime() + (0.1 + rand() * 2) * DAY) });
    }
    comments.push({ user: who._id, name: who.username, text: composeComment(r), recipeId: r._id, createdAt, replies, isDemo: true });
  }
}
if (comments.length) await Comment.insertMany(comments, { ordered: false });
console.log(`Created ${comments.length} comments`);

console.log('\nSample community ready. Remove it any time with: node scripts/seed-community.js --remove');
await mongoose.disconnect();
