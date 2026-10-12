import express from 'express';
import upload from '../multer.js';
import Recipe from './schema.js';
import Rating from './rating.js';
import User from '../User/user.js';
import Cookbook from '../Cookbook/schema.js';
import Comment from '../Comment/schema.js';
import { requireAuth, optionalAuth } from '../../../middleware/auth.js';
import { uploadImage } from '../../../utils/imageUpload.js';
import { asyncHandler, HttpError, requireId, escapeRegex, str } from '../../../utils/http.js';

const router = express.Router();

const DIETS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const asArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [v];
    } catch {
      return v.split('\n');
    }
  }
  return [];
};

const num = (v, min, max) => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(400, 'A number field is out of range.');
  return n;
};

// Accepts JSON or multipart bodies (arrays may arrive as JSON strings).
const parseRecipeInput = (body) => {
  const ingredients = asArray(body.ingredients)
    .map((i) => (typeof i === 'string' ? { name: i, amount: '' } : { name: str(i?.name, 120), amount: str(i?.amount, 60) }))
    .filter((i) => i.name.trim());
  const directions = asArray(body.directions).map((d) => str(String(d), 2000)).filter(Boolean);
  const diets = asArray(body.diets).filter((d) => DIETS.includes(d));
  const tags = asArray(body.tags).map((t) => str(String(t), 40)).filter(Boolean).slice(0, 10);
  const difficulty = DIFFICULTIES.includes(body.difficulty) ? body.difficulty : undefined;

  const data = {
    name: str(body.name, 140),
    description: str(body.description, 2000),
    ingredients,
    directions,
    diets,
    tags,
    difficulty,
    category: str(body.category, 60) || undefined,
    cuisine: str(body.cuisine, 60) || undefined,
    story: str(body.story, 1000) || undefined,
    prepTime: num(body.prepTime, 0, 10000),
    cookTime: num(body.cookTime, 0, 10000),
    servings: num(body.servings, 1, 1000),
  };
  if (typeof body.imageUrl === 'string' && /^https?:\/\//.test(body.imageUrl)) data.image = body.imageUrl;
  return data;
};

const isMember = (cookbookId, userId) => Cookbook.exists({ _id: cookbookId, 'members.user': userId });

// Can this viewer see this recipe?
const canView = async (recipe, user) => {
  if (recipe.visibility === 'public') return true;
  return Boolean(user && recipe.cookbook && (await isMember(recipe.cookbook, user._id)));
};

const shape = (recipe) => {
  const r = recipe.toObject ? recipe.toObject() : recipe;
  r.totalTime = (r.prepTime || 0) + (r.cookTime || 0) || undefined;
  delete r.ingredientKeys;
  return r;
};

// --- Browse ---------------------------------------------------------------

router.get(
  '/recipes',
  asyncHandler(async (req, res) => {
    const { category, cuisine, diet, sort } = req.query;
    const q = str(req.query.q || req.query.recipe, 80);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const filter = { visibility: 'public' };
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { ingredientKeys: rx }, { cuisine: rx }, { category: rx }, { tags: rx }];
    }
    if (typeof category === 'string' && category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    if (typeof cuisine === 'string' && cuisine) filter.cuisine = new RegExp(`^${escapeRegex(cuisine)}$`, 'i');
    if (typeof diet === 'string' && DIETS.includes(diet)) filter.diets = diet;
    const maxTime = Number(req.query.maxTime);
    if (maxTime > 0) filter.$expr = { $lte: [{ $add: [{ $ifNull: ['$prepTime', 0] }, { $ifNull: ['$cookTime', 0] }] }, maxTime] };
    if (maxTime > 0) filter.cookTime = { $exists: true };

    const sorts = { new: { createdAt: -1 }, top: { ratingAvg: -1, ratingCount: -1 }, saved: { saveCount: -1 }, name: { name: 1 } };
    const [items, total] = await Promise.all([
      Recipe.find(filter)
        .sort(sorts[sort] || sorts.new)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'username')
        .select('-ingredientKeys -directions'),
      Recipe.countDocuments(filter),
    ]);
    res.json({ items: items.map(shape), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  })
);

// Filter options with counts
router.get(
  '/recipes/facets',
  asyncHandler(async (req, res) => {
    const count = (field) =>
      Recipe.aggregate([
        { $match: { visibility: 'public', [field]: { $nin: [null, ''] } } },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 40 },
      ]);
    const [categories, cuisines] = await Promise.all([count('category'), count('cuisine')]);
    res.json({
      categories: categories.map((c) => ({ name: c._id, count: c.count })),
      cuisines: cuisines.map((c) => ({ name: c._id, count: c.count })),
      diets: DIETS,
    });
  })
);

router.get(
  '/recipes/user/:userId',
  asyncHandler(async (req, res) => {
    requireId(req.params.userId, 'user id');
    const recipes = await Recipe.find({ user: req.params.userId, visibility: 'public' })
      .sort({ createdAt: -1 })
      .populate('user', 'username')
      .select('-ingredientKeys -directions');
    res.json(recipes.map(shape));
  })
);

// Recipes the logged-in user saved
router.get(
  '/me/saved',
  requireAuth,
  asyncHandler(async (req, res) => {
    const me = await User.findById(req.user._id).select('savedRecipes');
    const recipes = await Recipe.find({ _id: { $in: me.savedRecipes } })
      .populate('user', 'username')
      .select('-ingredientKeys -directions');
    const visible = [];
    for (const r of recipes) if (await canView(r, req.user)) visible.push(shape(r));
    res.json(visible);
  })
);

router.get(
  '/recipes/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    requireId(req.params.id, 'recipe id');
    const recipe = await Recipe.findById(req.params.id).populate('user', 'username').populate('cookbook', 'name');
    // 404 (not 403) for hidden recipes so their existence isn't revealed
    if (!recipe || !(await canView(recipe, req.user))) throw new HttpError(404, 'Recipe not found.');
    const out = shape(recipe);
    if (req.user) {
      const [rating, me] = await Promise.all([
        Rating.findOne({ recipe: recipe._id, user: req.user._id }),
        User.findById(req.user._id).select('savedRecipes'),
      ]);
      out.myRating = rating?.value || 0;
      out.saved = me.savedRecipes.some((id) => id.equals(recipe._id));
    }
    res.json(out);
  })
);

// --- Create / edit / delete -----------------------------------------------

router.post(
  '/recipes',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const data = parseRecipeInput(req.body);
    if (req.file) data.image = await uploadImage(req.file);

    data.user = req.user._id;
    data.visibility = 'public';
    if (req.body.cookbook) {
      requireId(req.body.cookbook, 'cookbook id');
      if (!(await isMember(req.body.cookbook, req.user._id))) throw new HttpError(403, 'You are not a member of that cookbook.');
      data.cookbook = req.body.cookbook;
      // publishToSite=true keeps the recipe public as well as in the cookbook
      data.visibility = String(req.body.publishToSite) === 'true' ? 'public' : 'cookbook';
    }
    const recipe = await Recipe.create(data);
    res.status(201).json(shape(recipe));
  })
);

const loadOwned = async (req) => {
  requireId(req.params.id, 'recipe id');
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new HttpError(404, 'Recipe not found.');
  if (!recipe.user.equals(req.user._id)) throw new HttpError(403, 'You can only change your own recipes.');
  return recipe;
};

router.put(
  '/recipes/:id',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const recipe = await loadOwned(req);
    const data = parseRecipeInput({ ...recipe.toObject(), ...req.body });
    if (req.file) data.image = await uploadImage(req.file);
    recipe.set(data);
    await recipe.save();
    res.json(shape(recipe));
  })
);

router.delete(
  '/recipes/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const recipe = await loadOwned(req);
    await Promise.all([
      recipe.deleteOne(),
      Comment.deleteMany({ recipeId: recipe._id }),
      Rating.deleteMany({ recipe: recipe._id }),
      User.updateMany({ savedRecipes: recipe._id }, { $pull: { savedRecipes: recipe._id } }),
    ]);
    res.json({ message: 'Recipe deleted.' });
  })
);

// --- Ratings & saves ------------------------------------------------------

router.post(
  '/recipes/:id/rate',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireId(req.params.id, 'recipe id');
    const value = Number(req.body.value);
    if (!Number.isInteger(value) || value < 1 || value > 5) throw new HttpError(400, 'Rating must be 1-5.');
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe || !(await canView(recipe, req.user))) throw new HttpError(404, 'Recipe not found.');
    if (recipe.user.equals(req.user._id)) throw new HttpError(400, "You can't rate your own recipe.");

    await Rating.findOneAndUpdate({ recipe: recipe._id, user: req.user._id }, { value }, { upsert: true, new: true });
    const [agg] = await Rating.aggregate([
      { $match: { recipe: recipe._id } },
      { $group: { _id: null, avg: { $avg: '$value' }, count: { $sum: 1 } } },
    ]);
    recipe.ratingAvg = Math.round(agg.avg * 10) / 10;
    recipe.ratingCount = agg.count;
    await recipe.save();
    res.json({ ratingAvg: recipe.ratingAvg, ratingCount: recipe.ratingCount, myRating: value });
  })
);

const setSaved = (saved) =>
  asyncHandler(async (req, res) => {
    requireId(req.params.id, 'recipe id');
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe || !(await canView(recipe, req.user))) throw new HttpError(404, 'Recipe not found.');
    const update = saved ? { $addToSet: { savedRecipes: recipe._id } } : { $pull: { savedRecipes: recipe._id } };
    const before = await User.findByIdAndUpdate(req.user._id, update); // returns the pre-update doc
    const had = before.savedRecipes.some((id) => id.equals(recipe._id));
    if (saved !== had) {
      recipe.saveCount = Math.max(0, recipe.saveCount + (saved ? 1 : -1));
      await recipe.save();
    }
    res.json({ saved, saveCount: recipe.saveCount });
  });

router.post('/recipes/:id/save', requireAuth, setSaved(true));
router.delete('/recipes/:id/save', requireAuth, setSaved(false));

export default router;
