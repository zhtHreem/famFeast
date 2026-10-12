import mongoose from 'mongoose';

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const isId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

export const requireId = (id, label = 'id') => {
  if (!isId(id)) throw new HttpError(400, `Invalid ${label}.`);
  return id;
};

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const publicUser = (u) => ({
  id: u._id.toString(),
  username: u.username,
  bio: u.bio || '',
  followers: u.followers?.length ?? 0,
  following: u.following?.length ?? 0,
});
