// Integration tests. They run against the separate "FamFest_test" database (never the live one).
// Prerequisite: `MONGO_DB_NAME=FamFest_test npm run seed` once, so recipes exist for browse/pantry tests.
import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';

process.env.MONGO_DB_NAME = 'FamFest_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.AUTH_RATE_LIMIT_MAX = '1000';
process.env.RATE_LIMIT_MAX = '100000';

const { default: app } = await import('../src/app.js');
const { default: connectDB } = await import('../src/database/connectivity.js');
const { default: User } = await import('../src/database/models/User/user.js');
const { default: Recipe } = await import('../src/database/models/Recipe/schema.js');
const { default: Cookbook } = await import('../src/database/models/Cookbook/schema.js');
const { default: Comment } = await import('../src/database/models/Comment/schema.js');
const { default: Rating } = await import('../src/database/models/Recipe/rating.js');

jest.setTimeout(30000);

const run = Date.now().toString(36);
const mk = (n) => ({ username: `t_${n}_${run}`, email: `t_${n}_${run}@example.com`, password: 'correct-horse-9' });
const auth = (t) => ({ Authorization: `Bearer ${t}` });

const recipeBody = (over = {}) => ({
  name: `Test Dal ${run}`,
  description: 'Comforting lentils.',
  ingredients: [{ name: 'red lentils', amount: '1 cup' }, { name: 'Onions', amount: '1' }, { name: 'turmeric', amount: '1 tsp' }],
  directions: ['Boil lentils.', 'Fry onion and mix.'],
  category: 'Vegetarian',
  cuisine: 'Pakistani',
  diets: ['vegetarian'],
  prepTime: 10,
  cookTime: 25,
  servings: 4,
  ...over,
});

let alice, bob, carol; // { token, user }
let recipeId;

beforeAll(async () => {
  await connectDB();
  const reg = async (n) => (await request(app).post('/api/auth/register').send(mk(n))).body;
  [alice, bob, carol] = await Promise.all([reg('alice'), reg('bob'), reg('carol')]);
});

afterAll(async () => {
  const users = await User.find({ email: new RegExp(`_${run}@example.com$`) }).select('_id');
  const ids = users.map((u) => u._id);
  await Promise.all([
    Recipe.deleteMany({ user: { $in: ids } }),
    Cookbook.deleteMany({ owner: { $in: ids } }),
    Comment.deleteMany({ user: { $in: ids } }),
    Rating.deleteMany({ user: { $in: ids } }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);
  await mongoose.disconnect();
});

describe('auth', () => {
  test('register returns token and never the password', async () => {
    expect(alice.token).toBeTruthy();
    expect(JSON.stringify(alice)).not.toMatch(/password/i);
  });

  test.each([
    [{ username: 'ab', email: 'a@b.co', password: 'longenough1' }, /Username/],
    [{ username: 'valid_name', email: 'nope', password: 'longenough1' }, /email/i],
    [{ username: 'valid_name', email: 'a@b.co', password: 'short' }, /8 characters/],
  ])('rejects invalid registration %#', async (body, msg) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(msg);
  });

  test('duplicate email -> 409', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...mk('dup'), email: mk('alice').email });
    expect(res.status).toBe(409);
  });

  test('login works, wrong password and unknown email give the same error', async () => {
    const ok = await request(app).post('/api/auth/login').send({ email: mk('alice').email, password: mk('alice').password });
    expect(ok.status).toBe(200);
    const bad = await request(app).post('/api/auth/login').send({ email: mk('alice').email, password: 'wrong-wrong' });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'wrong-wrong' });
    expect(bad.status).toBe(401);
    expect(bad.body.error).toBe(unknown.body.error);
  });

  test('NoSQL operator injection in login is neutralised', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(res.status).toBe(401);
  });

  test('/auth/me needs a valid token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Authorization', 'Bearer garbage')).status).toBe(401);
    const res = await request(app).get('/api/auth/me').set(auth(alice.token));
    expect(res.body.user.username).toBe(mk('alice').username);
  });

  test('user search and profile never expose password or email', async () => {
    const list = await request(app).get('/api/users').query({ q: `t_alice_${run}` });
    expect(list.body.length).toBe(1);
    const profile = await request(app).get(`/api/users/${alice.user.id}`);
    expect(JSON.stringify([list.body, profile.body])).not.toMatch(/password|email/i);
  });
});

describe('recipes', () => {
  test('anonymous users cannot create', async () => {
    expect((await request(app).post('/api/recipes').send(recipeBody())).status).toBe(401);
  });

  test('create validates required fields', async () => {
    const res = await request(app).post('/api/recipes').set(auth(alice.token)).send(recipeBody({ ingredients: [] }));
    expect(res.status).toBe(400);
  });

  test('create (JSON) and read back', async () => {
    const res = await request(app).post('/api/recipes').set(auth(alice.token)).send(recipeBody());
    expect(res.status).toBe(201);
    recipeId = res.body._id;
    expect(res.body.totalTime).toBe(35);
    const got = await request(app).get(`/api/recipes/${recipeId}`);
    expect(got.status).toBe(200);
    expect(got.body.user.username).toBe(mk('alice').username);
    expect(got.body.ingredientKeys).toBeUndefined();
  });

  test('create (multipart, JSON-string arrays) works like the web form', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .set(auth(alice.token))
      .field('name', `Form Recipe ${run}`)
      .field('description', 'via form')
      .field('ingredients', JSON.stringify([{ name: 'rice', amount: '1 cup' }]))
      .field('directions', JSON.stringify(['Cook it.']));
    expect(res.status).toBe(201);
  });

  test("another user cannot edit or delete someone's recipe", async () => {
    const put = await request(app).put(`/api/recipes/${recipeId}`).set(auth(bob.token)).send({ name: 'hacked' });
    const del = await request(app).delete(`/api/recipes/${recipeId}`).set(auth(bob.token));
    expect(put.status).toBe(403);
    expect(del.status).toBe(403);
    expect((await request(app).delete(`/api/recipes/${recipeId}`)).status).toBe(401);
  });

  test('owner can edit; fields not sent are preserved', async () => {
    const res = await request(app).put(`/api/recipes/${recipeId}`).set(auth(alice.token)).send({ name: `Better Dal ${run}` });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(`Better Dal ${run}`);
    expect(res.body.ingredients).toHaveLength(3);
    expect(res.body.cookTime).toBe(25);
  });

  test('browse supports search, filters and pagination', async () => {
    const q = await request(app).get('/api/recipes').query({ q: `Better Dal ${run}` });
    expect(q.body.total).toBe(1);
    const cuisine = await request(app).get('/api/recipes').query({ cuisine: 'Pakistani' });
    expect(cuisine.body.items.some((r) => r._id === recipeId)).toBe(true);
    const page = await request(app).get('/api/recipes').query({ limit: 5, page: 2 });
    expect(page.body.items).toHaveLength(5);
    expect(page.body.pages).toBeGreaterThan(1);
  });

  test('regex metacharacters in search do not crash', async () => {
    const res = await request(app).get('/api/recipes').query({ q: '(((' });
    expect(res.status).toBe(200);
  });

  test('invalid ids give 400, unknown ids 404', async () => {
    expect((await request(app).get('/api/recipes/not-an-id')).status).toBe(400);
    expect((await request(app).get(`/api/recipes/${new mongoose.Types.ObjectId()}`)).status).toBe(404);
  });

  test('rating: validates, blocks self-rating, averages', async () => {
    expect((await request(app).post(`/api/recipes/${recipeId}/rate`).set(auth(alice.token)).send({ value: 5 })).status).toBe(400);
    expect((await request(app).post(`/api/recipes/${recipeId}/rate`).set(auth(bob.token)).send({ value: 9 })).status).toBe(400);
    await request(app).post(`/api/recipes/${recipeId}/rate`).set(auth(bob.token)).send({ value: 4 });
    const res = await request(app).post(`/api/recipes/${recipeId}/rate`).set(auth(carol.token)).send({ value: 5 });
    expect(res.body).toMatchObject({ ratingAvg: 4.5, ratingCount: 2 });
    // re-rating replaces, not duplicates
    const again = await request(app).post(`/api/recipes/${recipeId}/rate`).set(auth(carol.token)).send({ value: 3 });
    expect(again.body).toMatchObject({ ratingAvg: 3.5, ratingCount: 2 });
  });

  test('save / unsave keeps counts consistent and is idempotent', async () => {
    await request(app).post(`/api/recipes/${recipeId}/save`).set(auth(bob.token));
    const dup = await request(app).post(`/api/recipes/${recipeId}/save`).set(auth(bob.token));
    expect(dup.body.saveCount).toBe(1);
    const mine = await request(app).get('/api/me/saved').set(auth(bob.token));
    expect(mine.body.map((r) => r._id)).toContain(recipeId);
    const detail = await request(app).get(`/api/recipes/${recipeId}`).set(auth(bob.token));
    expect(detail.body.saved).toBe(true);
    const off = await request(app).delete(`/api/recipes/${recipeId}/save`).set(auth(bob.token));
    expect(off.body.saveCount).toBe(0);
  });
});

describe('follow', () => {
  test('follow/unfollow uses the token, not a client-supplied id', async () => {
    expect((await request(app).post(`/api/follow/${bob.user.id}`)).status).toBe(401);
    await request(app).post(`/api/follow/${bob.user.id}`).set(auth(alice.token)).send({ loggedInUser: carol.user.id });
    const followers = await request(app).get(`/api/users/${bob.user.id}/follower`);
    expect(followers.body.followers.map((u) => u.id)).toEqual([alice.user.id]);
    expect((await request(app).post(`/api/follow/${alice.user.id}`).set(auth(alice.token))).status).toBe(400);
    await request(app).post(`/api/unfollow/${bob.user.id}`).set(auth(alice.token));
    const after = await request(app).get(`/api/users/${bob.user.id}/follower`);
    expect(after.body.followers).toHaveLength(0);
  });
});

describe('comments', () => {
  test('need login; author name comes from the token', async () => {
    expect((await request(app).post('/api/comments').send({ text: 'hi', recipeId })).status).toBe(401);
    const res = await request(app).post('/api/comments').set(auth(bob.token)).send({ text: 'Yum!', recipeId, name: 'Impostor' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe(mk('bob').username);
    const reply = await request(app).post(`/api/comments/${res.body._id}/replies`).set(auth(alice.token)).send({ text: 'Thanks' });
    expect(reply.body.replies).toHaveLength(1);
    expect((await request(app).delete(`/api/comments/${res.body._id}`).set(auth(carol.token))).status).toBe(403);
    expect((await request(app).delete(`/api/comments/${res.body._id}`).set(auth(alice.token))).status).toBe(200); // recipe owner may moderate
    const list = await request(app).get('/api/comments').query({ recipeId });
    expect(list.body).toHaveLength(0);
  });
});

describe('pantry', () => {
  test('requires ingredients', async () => {
    expect((await request(app).post('/api/pantry/match').send({ ingredients: [] })).status).toBe(400);
  });

  test('ranks recipes by coverage, reports missing items with substitutes', async () => {
    const res = await request(app).post('/api/pantry/match').send({ ingredients: ['Red Lentils', 'onions'], maxMissing: 2 });
    expect(res.status).toBe(200);
    const mine = res.body.items.find((r) => r.id === recipeId);
    expect(mine).toMatchObject({ percent: 67 });
    expect(mine.missing.map((m) => m.name)).toEqual(['turmeric']);
    for (let i = 1; i < res.body.items.length; i++) expect(res.body.items[i - 1].percent).toBeGreaterThanOrEqual(res.body.items[i].percent);
  });

  test('can-make-now when everything is covered; staples are assumed', async () => {
    const res = await request(app).post('/api/pantry/match').send({ ingredients: ['lentils', 'onion', 'turmeric'], maxMissing: 0 });
    const mine = res.body.items.find((r) => r.id === recipeId);
    expect(mine.percent).toBe(100);
    expect(mine.missing).toEqual([]);
  });

  test('maxMissing filters out recipes needing too much', async () => {
    const res = await request(app).post('/api/pantry/match').send({ ingredients: ['onion'], maxMissing: 0, limit: 60 });
    expect(res.body.items.every((r) => r.missing.length === 0)).toBe(true);
  });

  test('autocomplete and substitutes', async () => {
    const ac = await request(app).get('/api/pantry/ingredients').query({ q: 'chick' });
    expect(ac.body.some((k) => k.startsWith('chick'))).toBe(true);
    const sub = await request(app).get('/api/pantry/substitutes').query({ item: 'Buttermilk' });
    expect(sub.body.substitutes.length).toBeGreaterThan(0);
  });

  test('AI endpoints need login and degrade gracefully with no key', async () => {
    expect((await request(app).post('/api/ai/parse-ingredients').send({ text: 'eggs' })).status).toBe(401);
    const saved = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const parsed = await request(app).post('/api/ai/parse-ingredients').set(auth(alice.token)).send({ text: 'eggs, rice and onion' });
    expect(parsed.body).toEqual({ ingredients: ['eggs', 'rice', 'onion'], ai: false });
    const photo = await request(app).post('/api/ai/pantry-from-photo').set(auth(alice.token)).attach('image', Buffer.from('x'), { filename: 'a.png', contentType: 'image/png' });
    expect(photo.status).toBe(503);
    if (saved) process.env.GEMINI_API_KEY = saved;
  });
});

describe('family cookbooks', () => {
  let bookId, code, privateRecipeId;

  test('create, join with code, membership listed', async () => {
    const created = await request(app).post('/api/cookbooks').set(auth(alice.token)).send({ name: 'Alice Family Kitchen' });
    expect(created.status).toBe(201);
    bookId = created.body.id;
    code = created.body.inviteCode;
    expect((await request(app).post('/api/cookbooks/join').set(auth(bob.token)).send({ code: 'BADCODE0' })).status).toBe(404);
    const join = await request(app).post('/api/cookbooks/join').set(auth(bob.token)).send({ code: code.toLowerCase() });
    expect(join.status).toBe(200);
    expect(join.body.memberCount).toBe(2);
    // joining twice does not duplicate
    const again = await request(app).post('/api/cookbooks/join').set(auth(bob.token)).send({ code });
    expect(again.body.memberCount).toBe(2);
  });

  test('members can add private recipes; non-members cannot', async () => {
    const forbidden = await request(app).post('/api/recipes').set(auth(carol.token)).send(recipeBody({ cookbook: bookId }));
    expect(forbidden.status).toBe(403);
    const res = await request(app).post('/api/recipes').set(auth(bob.token)).send(recipeBody({ name: `Nani Biryani ${run}`, cookbook: bookId, story: 'Saffron goes in last' }));
    expect(res.status).toBe(201);
    expect(res.body.visibility).toBe('cookbook');
    privateRecipeId = res.body._id;
  });

  test('private recipes are hidden from everyone outside the cookbook', async () => {
    const browse = await request(app).get('/api/recipes').query({ q: `Nani Biryani ${run}` });
    expect(browse.body.total).toBe(0);
    expect((await request(app).get(`/api/recipes/${privateRecipeId}`)).status).toBe(404);
    expect((await request(app).get(`/api/recipes/${privateRecipeId}`).set(auth(carol.token))).status).toBe(404);
    expect((await request(app).get(`/api/recipes/${privateRecipeId}`).set(auth(alice.token))).status).toBe(200);
    expect((await request(app).get('/api/comments').query({ recipeId: privateRecipeId })).status).toBe(404);
    const profile = await request(app).get(`/api/recipes/user/${bob.user.id}`);
    expect(profile.body.items.find((r) => r._id === privateRecipeId)).toBeUndefined();
    expect((await request(app).post(`/api/recipes/${privateRecipeId}/save`).set(auth(carol.token))).status).toBe(404);
  });

  test('cookbook page: members see recipes; invite code only for owner; outsiders get 404', async () => {
    const asOwner = await request(app).get(`/api/cookbooks/${bookId}`).set(auth(alice.token));
    expect(asOwner.body.inviteCode).toBe(code);
    expect(asOwner.body.recipes.map((r) => r._id)).toContain(privateRecipeId);
    const asMember = await request(app).get(`/api/cookbooks/${bookId}`).set(auth(bob.token));
    expect(asMember.body.inviteCode).toBeUndefined();
    expect((await request(app).get(`/api/cookbooks/${bookId}`).set(auth(carol.token))).status).toBe(404);
    expect((await request(app).get(`/api/cookbooks/${bookId}`)).status).toBe(401);
  });

  test('pantry can search the family cookbook only for members', async () => {
    const body = { ingredients: ['red lentils', 'onion', 'turmeric'], scope: 'cookbooks', maxMissing: 0 };
    const member = await request(app).post('/api/pantry/match').set(auth(alice.token)).send(body);
    expect(member.body.items.map((r) => r.id)).toContain(privateRecipeId);
    const outsider = await request(app).post('/api/pantry/match').set(auth(carol.token)).send({ ...body, scope: 'all' });
    expect(outsider.body.items.map((r) => r.id)).not.toContain(privateRecipeId);
    expect((await request(app).post('/api/pantry/match').send(body)).status).toBe(401);
  });

  test('only the owner can regenerate the code, remove members or delete', async () => {
    expect((await request(app).post(`/api/cookbooks/${bookId}/regenerate-code`).set(auth(bob.token))).status).toBe(403);
    expect((await request(app).delete(`/api/cookbooks/${bookId}`).set(auth(bob.token))).status).toBe(403);
    const fresh = await request(app).post(`/api/cookbooks/${bookId}/regenerate-code`).set(auth(alice.token));
    expect(fresh.body.inviteCode).not.toBe(code);
    expect((await request(app).post('/api/cookbooks/join').set(auth(carol.token)).send({ code })).status).toBe(404); // old code dead
  });

  test('a member can leave; the owner cannot', async () => {
    expect((await request(app).delete(`/api/cookbooks/${bookId}/members/${alice.user.id}`).set(auth(alice.token))).status).toBe(400);
    expect((await request(app).delete(`/api/cookbooks/${bookId}/members/${bob.user.id}`).set(auth(bob.token))).status).toBe(200);
    expect((await request(app).get(`/api/cookbooks/${bookId}`).set(auth(bob.token))).status).toBe(404);
  });

  test('deleting a cookbook removes its private recipes', async () => {
    expect((await request(app).delete(`/api/cookbooks/${bookId}`).set(auth(alice.token))).status).toBe(200);
    expect(await Recipe.findById(privateRecipeId)).toBeNull();
  });
});

describe('hardening', () => {
  test('security headers are set and unknown API routes 404 as JSON', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('malformed JSON gives 400, not a stack trace', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
  });

  test('CORS allows the configured origin only', async () => {
    const ok = await request(app).get('/api/health').set('Origin', 'http://localhost:3000');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    const evil = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('deleting your account needs the password and removes your public recipes', async () => {
    expect((await request(app).delete('/api/users/me').set(auth(carol.token)).send({ password: 'wrong-wrong' })).status).toBe(401);
    const res = await request(app).delete('/api/users/me').set(auth(carol.token)).send({ password: mk('carol').password });
    expect(res.status).toBe(200);
    expect((await request(app).get('/api/auth/me').set(auth(carol.token))).status).toBe(401);
  });
});

describe('pantry matching accuracy', () => {
  test('"eggs" does not satisfy "egg plant" / eggplant', async () => {
    const { normalizeIngredient, satisfies, matchRecipe } = await import('../src/utils/ingredients.js');
    expect(normalizeIngredient('4 Egg Plants')).toBe('eggplant');
    expect(satisfies('egg', 'eggplant')).toBe(false);
    const { score } = matchRecipe(['egg'], ['eggplant', 'egg'], { assumeStaples: true });
    expect(score).toBe(0.5);
  });

  test.each([
    ['chicken', 'chicken stock', false],
    ['milk', 'coconut milk', false],
    ['flour', 'almond flour', false],
    ['butter', 'peanut butter', false],
    ['pea', 'black eyed pea', false],
    ['red onion', 'onion', true],
    ['rice', 'basmati rice', true],
    ['lemon', 'lemon juice', true],
    ['chicken', 'chicken wing', true],
  ])('satisfies(%s, %s) = %s', async (pantry, recipe, expected) => {
    const { satisfies } = await import('../src/utils/ingredients.js');
    expect(satisfies(pantry, recipe)).toBe(expected);
  });
});

describe('legacy data in the database', () => {
  test('a recipe from the old site (no ingredientKeys / visibility) does not break pantry search', async () => {
    // Regression for a production 500: such a document makes distinct('ingredientKeys') return null.
    const legacy = await Recipe.collection.insertOne({ user: 'someone', name: `LEGACY ${run}`, description: 'old', ingredients: ['1 egg', '2 cups flour'], directions: ['mix'], image: 'x' });
    try {
      const res = await request(app).post('/api/pantry/match').send({ ingredients: ['egg', 'flour'], maxMissing: 5, limit: 60 });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.find((r) => r.name === `LEGACY ${run}`)).toBeUndefined(); // never listed
      const list = await request(app).get('/api/recipes').query({ q: `LEGACY ${run}` });
      expect(list.body.total).toBe(0);
    } finally {
      await Recipe.collection.deleteOne({ _id: legacy.insertedId });
    }
  });

  test('satisfies() never throws on bad input', async () => {
    const { satisfies } = await import('../src/utils/ingredients.js');
    expect(satisfies(null, 'egg')).toBe(false);
    expect(satisfies('egg', undefined)).toBe(false);
    expect(satisfies('', 'egg')).toBe(false);
  });
});
