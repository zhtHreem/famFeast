import express from 'express';
import Comment from './schema.js';
import Recipe from '../Recipe/schema.js';
import Cookbook from '../Cookbook/schema.js';
import { requireAuth, optionalAuth } from '../../../middleware/auth.js';
import { asyncHandler, HttpError, requireId, str } from '../../../utils/http.js';

const router = express.Router();

// A viewer may read/write comments only on recipes they can see.
const visibleRecipe = async (recipeId, user) => {
  requireId(recipeId, 'recipe id');
  const recipe = await Recipe.findById(recipeId).select('visibility cookbook');
  if (!recipe) throw new HttpError(404, 'Recipe not found.');
  if (recipe.visibility === 'public') return recipe;
  const ok = user && (await Cookbook.exists({ _id: recipe.cookbook, 'members.user': user._id }));
  if (!ok) throw new HttpError(404, 'Recipe not found.');
  return recipe;
};

router.get(
  '/comments',
  optionalAuth,
  asyncHandler(async (req, res) => {
    await visibleRecipe(req.query.recipeId, req.user);
    const comments = await Comment.find({ recipeId: req.query.recipeId }).sort({ createdAt: -1 }).limit(200);
    res.json(comments);
  })
);

router.post(
  '/comments',
  requireAuth,
  asyncHandler(async (req, res) => {
    await visibleRecipe(req.body.recipeId, req.user);
    const text = str(req.body.text, 1000);
    if (!text) throw new HttpError(400, 'Comment cannot be empty.');
    const comment = await Comment.create({ user: req.user._id, name: req.user.username, text, recipeId: req.body.recipeId });
    res.status(201).json(comment);
  })
);

router.post(
  '/comments/:id/replies',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireId(req.params.id, 'comment id');
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw new HttpError(404, 'Comment not found.');
    await visibleRecipe(comment.recipeId, req.user);
    const text = str(req.body.text, 1000);
    if (!text) throw new HttpError(400, 'Reply cannot be empty.');
    comment.replies.push({ user: req.user._id, name: req.user.username, text });
    await comment.save();
    res.status(201).json(comment);
  })
);

router.delete(
  '/comments/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireId(req.params.id, 'comment id');
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw new HttpError(404, 'Comment not found.');
    const recipe = await Recipe.findById(comment.recipeId).select('user');
    const mine = comment.user?.equals(req.user._id);
    const recipeOwner = recipe?.user.equals(req.user._id);
    if (!mine && !recipeOwner) throw new HttpError(403, 'You cannot delete this comment.');
    await comment.deleteOne();
    res.json({ message: 'Comment deleted.' });
  })
);

export default router;
