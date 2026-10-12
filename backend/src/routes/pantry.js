import express from 'express';
import Recipe from '../database/models/Recipe/schema.js';
import Cookbook from '../database/models/Cookbook/schema.js';
import User from '../database/models/User/user.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { asyncHandler, HttpError, str } from '../utils/http.js';
import { normalizeIngredient, normalizeList, matchRecipe } from '../utils/ingredients.js';
import { substitutesFor } from '../data/substitutions.js';

const router = express.Router();

const DIETS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal'];

// Which recipes may this viewer search?
const scopeFilter = async (scope, user) => {
  const memberBooks = user ? (await Cookbook.find({ 'members.user': user._id }).select('_id')).map((c) => c._id) : [];
  switch (scope) {
    case 'public':
      return { visibility: 'public' };
    case 'cookbooks':
      if (!user) throw new HttpError(401, 'Log in to search your family cookbooks.');
      return { cookbook: { $in: memberBooks } };
    case 'saved': {
      if (!user) throw new HttpError(401, 'Log in to search your saved recipes.');
      const me = await User.findById(user._id).select('savedRecipes');
      return { _id: { $in: me.savedRecipes }, $or: [{ visibility: 'public' }, { cookbook: { $in: memberBooks } }] };
    }
    default:
      return memberBooks.length ? { $or: [{ visibility: 'public' }, { cookbook: { $in: memberBooks } }] } : { visibility: 'public' };
  }
};

router.post(
  '/pantry/match',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const raw = Array.isArray(req.body.ingredients) ? req.body.ingredients.slice(0, 60) : [];
    const pantry = normalizeList(raw.map((i) => str(String(i), 80)));
    if (pantry.length === 0) throw new HttpError(400, 'Add at least one ingredient.');

    const maxMissing = Math.min(10, Math.max(0, Number.isFinite(+req.body.maxMissing) ? +req.body.maxMissing : 3));
    const assumeStaples = req.body.assumeStaples !== false;
    const limit = Math.min(60, Math.max(1, parseInt(req.body.limit, 10) || 24));

    const filter = await scopeFilter(req.body.scope, req.user);
    if (DIETS.includes(req.body.diet)) filter.diets = req.body.diet;

    const recipes = await Recipe.find(filter)
      .select('name image category cuisine ratingAvg ratingCount cookTime prepTime ingredientKeys visibility cookbook diets')
      .lean();

    const results = [];
    for (const r of recipes) {
      const { have, missing, score } = matchRecipe(pantry, r.ingredientKeys, { assumeStaples });
      const isStaple = (k) => assumeStaples && ['salt', 'pepper', 'water', 'vegetable oil', 'olive oil'].includes(k);
      const missingReal = missing.filter((k) => !isStaple(k));
      if (score === 0 || missingReal.length > maxMissing) continue;
      results.push({
        id: r._id.toString(),
        name: r.name,
        image: r.image,
        category: r.category,
        cuisine: r.cuisine,
        ratingAvg: r.ratingAvg,
        ratingCount: r.ratingCount,
        visibility: r.visibility,
        percent: Math.round(score * 100),
        haveCount: have.filter((k) => !isStaple(k)).length,
        total: r.ingredientKeys.filter((k) => !isStaple(k)).length,
        missing: missingReal.map((name) => ({ name, substitutes: substitutesFor(name) })),
      });
    }
    results.sort((a, b) => b.percent - a.percent || a.missing.length - b.missing.length || b.ratingAvg - a.ratingAvg);
    res.json({
      pantry,
      totalMatches: results.length,
      canMakeNow: results.filter((r) => r.missing.length === 0).length,
      items: results.slice(0, limit),
    });
  })
);

// Ingredient autocomplete, built from the recipes themselves (cached briefly).
let cache = { at: 0, keys: [] };
const ingredientKeys = async () => {
  if (Date.now() - cache.at < 10 * 60 * 1000 && cache.keys.length) return cache.keys;
  const rows = await Recipe.aggregate([
    { $match: { visibility: 'public' } },
    { $unwind: '$ingredientKeys' },
    { $group: { _id: '$ingredientKeys', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1500 },
  ]);
  cache = { at: Date.now(), keys: rows.map((r) => r._id) };
  return cache.keys;
};

router.get(
  '/pantry/ingredients',
  asyncHandler(async (req, res) => {
    const q = str(req.query.q, 40).toLowerCase();
    const keys = await ingredientKeys();
    if (!q) return res.json(keys.slice(0, 40));
    const starts = keys.filter((k) => k.startsWith(q));
    const contains = keys.filter((k) => !k.startsWith(q) && k.includes(q));
    res.json([...starts, ...contains].slice(0, 12));
  })
);

router.get('/pantry/substitutes', (req, res) => {
  const key = normalizeIngredient(str(req.query.item, 80));
  if (!key) throw new HttpError(400, 'Provide ?item=');
  res.json({ item: key, substitutes: substitutesFor(key) || [] });
});

// A logged-in user's saved pantry
router.get(
  '/me/pantry',
  requireAuth,
  asyncHandler(async (req, res) => {
    const me = await User.findById(req.user._id).select('pantry');
    res.json({ pantry: me.pantry });
  })
);

router.put(
  '/me/pantry',
  requireAuth,
  asyncHandler(async (req, res) => {
    const pantry = [...new Set((Array.isArray(req.body.pantry) ? req.body.pantry : []).map((i) => str(String(i), 80).toLowerCase()).filter(Boolean))].slice(0, 100);
    await User.findByIdAndUpdate(req.user._id, { pantry });
    res.json({ pantry });
  })
);

export default router;
