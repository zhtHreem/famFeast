import express from 'express';
import User from './user.js';
import Recipe from '../Recipe/schema.js';
import Comment from '../Comment/schema.js';
import { requireAuth, signToken } from '../../../middleware/auth.js';
import { authLimiter } from '../../../middleware/security.js';
import { asyncHandler, HttpError, requireId, escapeRegex, str, publicUser } from '../../../utils/http.js';

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[A-Za-z0-9_.]{3,30}$/;

const authPayload = (user) => ({
  token: signToken(user),
  user: { id: user._id.toString(), username: user.username, email: user.email, bio: user.bio || '' },
});

const validatePassword = (pw) => {
  if (typeof pw !== 'string' || pw.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');
  if (pw.length > 128) throw new HttpError(400, 'Password is too long.');
};

// --- Auth -----------------------------------------------------------------

router.post(
  '/auth/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const username = str(req.body.username, 30);
    const email = str(req.body.email, 120).toLowerCase();
    const { password } = req.body;
    if (!USERNAME_RE.test(username)) {
      throw new HttpError(400, 'Username must be 3-30 characters: letters, numbers, "_" or ".".');
    }
    if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Please enter a valid email address.');
    validatePassword(password);

    try {
      const user = await User.create({ username, email, password });
      res.status(201).json(authPayload(user));
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw new HttpError(409, field === 'email' ? 'Email address is already in use.' : 'Username is already taken.');
      }
      throw error;
    }
  })
);

router.post(
  '/auth/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = str(req.body.email, 120).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const user = email ? await User.findOne({ email }) : null;
    // Same message for unknown email and wrong password so accounts can't be enumerated.
    if (!user || !(await user.comparePassword(password))) {
      throw new HttpError(401, 'Invalid email or password.');
    }
    res.json(authPayload(user));
  })
);

router.get('/auth/me', requireAuth, (req, res) => {
  const u = req.user;
  res.json({ user: { id: u._id.toString(), username: u.username, email: u.email, bio: u.bio || '' } });
});

// --- Profiles -------------------------------------------------------------

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const q = str(req.query.q, 40);
    if (!q) return res.json([]);
    const users = await User.find({ username: new RegExp(escapeRegex(q), 'i') }).limit(20).select('username bio followers following');
    res.json(users.map(publicUser));
  })
);

router.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    requireId(req.params.id, 'user id');
    const user = await User.findById(req.params.id).select('username bio followers following createdAt');
    if (!user) throw new HttpError(404, 'User not found.');
    res.json({ ...publicUser(user), createdAt: user.createdAt, followerIds: user.followers, followingIds: user.following });
  })
);

const listRelation = (field) =>
  asyncHandler(async (req, res) => {
    requireId(req.params.id, 'user id');
    const user = await User.findById(req.params.id).populate(field, 'username bio');
    if (!user) throw new HttpError(404, 'User not found.');
    res.json({ [field]: user[field].map((u) => ({ id: u._id.toString(), username: u.username, bio: u.bio || '' })) });
  });

router.get('/users/:id/follower', listRelation('followers'));
router.get('/users/:id/following', listRelation('following'));

router.post(
  '/follow/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireId(req.params.id, 'user id');
    if (req.params.id === req.user.id) throw new HttpError(400, "You can't follow yourself.");
    const target = await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } }, { new: true });
    if (!target) throw new HttpError(404, 'User not found.');
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target._id } });
    res.json(publicUser(target));
  })
);

router.post(
  '/unfollow/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireId(req.params.id, 'user id');
    const target = await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } }, { new: true });
    if (!target) throw new HttpError(404, 'User not found.');
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: target._id } });
    res.json(publicUser(target));
  })
);

// --- Own account ----------------------------------------------------------

router.put(
  '/users/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (req.body.username !== undefined) {
      const username = str(req.body.username, 30);
      if (!USERNAME_RE.test(username)) throw new HttpError(400, 'Invalid username.');
      user.username = username;
    }
    if (req.body.bio !== undefined) user.bio = str(req.body.bio, 300);
    if (req.body.newPassword) {
      if (!(await user.comparePassword(req.body.currentPassword || ''))) {
        throw new HttpError(401, 'Current password is incorrect.');
      }
      validatePassword(req.body.newPassword);
      user.password = req.body.newPassword;
    }
    try {
      await user.save();
    } catch (error) {
      if (error.code === 11000) throw new HttpError(409, 'Username is already taken.');
      throw error;
    }
    res.json(authPayload(user));
  })
);

router.delete(
  '/users/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(req.body.password || ''))) throw new HttpError(401, 'Password is incorrect.');
    await Promise.all([
      Recipe.deleteMany({ user: user._id, visibility: 'public' }),
      Comment.deleteMany({ user: user._id }),
      User.updateMany({}, { $pull: { followers: user._id, following: user._id } }),
      user.deleteOne(),
    ]);
    res.json({ message: 'Account deleted.' });
  })
);

export default router;
