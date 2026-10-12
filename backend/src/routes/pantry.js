import express from 'express';
import Recipe from '../database/models/Recipe/schema.js';
import Cookbook from '../database/models/Cookbook/schema.js';
import User from '../database/models/User/user.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { asyncHandler, HttpError, str } from '../utils/http.js';
import { normalizeIngredient, normalizeList, satisfies, STAPLES } from '../utils/ingredients.js';
import { cached } from '../utils/cache.js';
import { substitutesFor } from '../data/substitutions.js';

const router = express.Router();

const DIETS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal'];

// Every distinct ingredient key in the collection (a few thousand short strings), cached.
// Used to expand a pantry item into the recipe keys it can satisfy ("chicken" -> "chicken breast", ...)
// so the database only has to look at recipes that can possibly match, via the multikey index.
const vocabulary = () => cached('vocab', 10 * 60 * 1000, () => Recipe.distinct('ingredientKeys'));

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

    // 1) Expand the pantry into every recipe key it can satisfy (cheap, in memory)
    const vocab = await vocabulary();
    const satisfiedKeys = vocab.filter((key) => pantry.some((p) => satisfies(p, key)));
    if (satisfiedKeys.length === 0) return res.json({ pantry, totalMatches: 0, canMakeNow: 0, items: [] });
    const staples = assumeStaples ? STAPLES : [];
    const satisfied = [...new Set([...satisfiedKeys, ...staples])];

    // 2) Score inside MongoDB: only the top `limit` recipes travel over the network
    const [out] = await Recipe.aggregate([
      { $match: { ...filter, ingredientKeys: { $in: satisfiedKeys } } },
      { $addFields: { countable: { $setDifference: ['$ingredientKeys', staples] } } },
      {
        $addFields: {
          haveKeys: { $setIntersection: ['$countable', satisfied] },
          missingKeys: { $setDifference: ['$countable', satisfied] },
        },
      },
      { $addFields: { total: { $size: '$countable' }, haveCount: { $size: '$haveKeys' }, missingCount: { $size: '$missingKeys' } } },
      { $match: { haveCount: { $gt: 0 }, missingCount: { $lte: maxMissing } } },
      { $addFields: { percent: { $round: [{ $multiply: [{ $divide: ['$haveCount', '$total'] }, 100] }, 0] } } },
      {
        $facet: {
          items: [
            { $sort: { percent: -1, missingCount: 1, ratingAvg: -1, _id: 1 } },
            { $limit: limit },
            { $project: { name: 1, image: 1, category: 1, cuisine: 1, ratingAvg: 1, ratingCount: 1, visibility: 1, percent: 1, haveCount: 1, total: 1, missingKeys: 1 } },
          ],
          stats: [{ $group: { _id: null, total: { $sum: 1 }, canMakeNow: { $sum: { $cond: [{ $eq: ['$missingCount', 0] }, 1, 0] } } } }],
        },
      },
    ]);

    res.json({
      pantry,
      totalMatches: out.stats[0]?.total || 0,
      canMakeNow: out.stats[0]?.canMakeNow || 0,
      items: out.items.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        image: r.image,
        category: r.category,
        cuisine: r.cuisine,
        ratingAvg: r.ratingAvg,
        ratingCount: r.ratingCount,
        visibility: r.visibility,
        percent: r.percent,
        haveCount: r.haveCount,
        total: r.total,
        missing: r.missingKeys.map((name) => ({ name, substitutes: substitutesFor(name) })),
      })),
    });
  })
);

// Ingredient autocomplete, built from the recipes themselves (cached briefly).
const ingredientKeys = () =>
  cached('popular-keys', 10 * 60 * 1000, async () => {
    const rows = await Recipe.aggregate([
      { $match: { visibility: 'public' } },
      { $unwind: '$ingredientKeys' },
      { $group: { _id: '$ingredientKeys', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1500 },
    ]);
    return rows.map((r) => r._id);
  });

router.get(
  '/pantry/ingredients',
  asyncHandler(async (req, res) => {
    const q = str(req.query.q, 40).toLowerCase();
    const keys = await ingredientKeys();
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    if (req.query.all === '1') return res.json(keys);
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
