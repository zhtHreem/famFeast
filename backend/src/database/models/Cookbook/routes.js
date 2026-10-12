import express from 'express';
import Cookbook, { newInviteCode } from './schema.js';
import Recipe from '../Recipe/schema.js';
import { requireAuth } from '../../../middleware/auth.js';
import { asyncHandler, HttpError, requireId, str } from '../../../utils/http.js';

const router = express.Router();
router.use('/cookbooks', requireAuth);

const summary = (cb, userId) => ({
  id: cb._id.toString(),
  name: cb.name,
  description: cb.description,
  memberCount: cb.members.length,
  role: cb.members.find((m) => m.user.equals(userId))?.role || 'member',
});

// Load a cookbook the caller belongs to (404 for everyone else, so codes/ids don't leak).
const loadMemberCookbook = async (req, populate = false) => {
  requireId(req.params.id, 'cookbook id');
  let query = Cookbook.findOne({ _id: req.params.id, 'members.user': req.user._id });
  if (populate) query = query.populate('members.user', 'username');
  const cookbook = await query;
  if (!cookbook) throw new HttpError(404, 'Cookbook not found.');
  return cookbook;
};

const isOwner = (cb, user) => cb.owner.equals(user._id);

router.get(
  '/cookbooks',
  asyncHandler(async (req, res) => {
    const books = await Cookbook.find({ 'members.user': req.user._id }).sort({ createdAt: -1 });
    res.json(books.map((b) => summary(b, req.user._id)));
  })
);

router.post(
  '/cookbooks',
  asyncHandler(async (req, res) => {
    const name = str(req.body.name, 80);
    if (name.length < 2) throw new HttpError(400, 'Give your cookbook a name.');
    const count = await Cookbook.countDocuments({ owner: req.user._id });
    if (count >= 10) throw new HttpError(400, 'You can own up to 10 cookbooks.');
    const cookbook = await Cookbook.create({
      name,
      description: str(req.body.description, 500),
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });
    res.status(201).json({ ...summary(cookbook, req.user._id), inviteCode: cookbook.inviteCode });
  })
);

router.post(
  '/cookbooks/join',
  asyncHandler(async (req, res) => {
    const code = str(req.body.code, 20).toUpperCase();
    const cookbook = code && (await Cookbook.findOne({ inviteCode: code }));
    if (!cookbook) throw new HttpError(404, 'Invalid invite code.');
    if (!cookbook.members.some((m) => m.user.equals(req.user._id))) {
      if (cookbook.members.length >= 50) throw new HttpError(400, 'This cookbook is full.');
      cookbook.members.push({ user: req.user._id, role: 'member' });
      await cookbook.save();
    }
    res.json(summary(cookbook, req.user._id));
  })
);

router.get(
  '/cookbooks/:id',
  asyncHandler(async (req, res) => {
    const cookbook = await loadMemberCookbook(req, true);
    const recipes = await Recipe.find({ cookbook: cookbook._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username')
      .select('-ingredientKeys -directions');
    res.json({
      id: cookbook._id.toString(),
      name: cookbook.name,
      description: cookbook.description,
      isOwner: isOwner(cookbook, req.user),
      // Only the owner sees the invite code
      inviteCode: isOwner(cookbook, req.user) ? cookbook.inviteCode : undefined,
      members: cookbook.members.map((m) => ({ id: m.user._id.toString(), username: m.user.username, role: m.role })),
      recipes,
    });
  })
);

router.post(
  '/cookbooks/:id/regenerate-code',
  asyncHandler(async (req, res) => {
    const cookbook = await loadMemberCookbook(req);
    if (!isOwner(cookbook, req.user)) throw new HttpError(403, 'Only the owner can do that.');
    cookbook.inviteCode = newInviteCode();
    await cookbook.save();
    res.json({ inviteCode: cookbook.inviteCode });
  })
);

router.delete(
  '/cookbooks/:id/members/:userId',
  asyncHandler(async (req, res) => {
    const cookbook = await loadMemberCookbook(req);
    requireId(req.params.userId, 'user id');
    const self = req.params.userId === req.user.id;
    if (!self && !isOwner(cookbook, req.user)) throw new HttpError(403, 'Only the owner can remove members.');
    if (cookbook.owner.equals(req.params.userId)) throw new HttpError(400, 'The owner cannot leave. Delete the cookbook instead.');
    cookbook.members = cookbook.members.filter((m) => !m.user.equals(req.params.userId));
    await cookbook.save();
    res.json({ message: self ? 'You left the cookbook.' : 'Member removed.' });
  })
);

router.put(
  '/cookbooks/:id',
  asyncHandler(async (req, res) => {
    const cookbook = await loadMemberCookbook(req);
    if (!isOwner(cookbook, req.user)) throw new HttpError(403, 'Only the owner can edit this cookbook.');
    if (req.body.name !== undefined) {
      const name = str(req.body.name, 80);
      if (name.length < 2) throw new HttpError(400, 'Give your cookbook a name.');
      cookbook.name = name;
    }
    if (req.body.description !== undefined) cookbook.description = str(req.body.description, 500);
    await cookbook.save();
    res.json(summary(cookbook, req.user._id));
  })
);

router.delete(
  '/cookbooks/:id',
  asyncHandler(async (req, res) => {
    const cookbook = await loadMemberCookbook(req);
    if (!isOwner(cookbook, req.user)) throw new HttpError(403, 'Only the owner can delete this cookbook.');
    // Recipes shared to the site stay public; cookbook-only recipes are removed with the book.
    await Recipe.deleteMany({ cookbook: cookbook._id, visibility: 'cookbook' });
    await Recipe.updateMany({ cookbook: cookbook._id }, { $unset: { cookbook: 1 } });
    await cookbook.deleteOne();
    res.json({ message: 'Cookbook deleted.' });
  })
);

export default router;
