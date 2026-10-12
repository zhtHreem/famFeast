import jwt from 'jsonwebtoken';
import User from '../database/models/User/user.js';

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return process.env.JWT_SECRET;
};

export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, secret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const readToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

// Attaches req.user when a valid token is present; never rejects.
export const optionalAuth = async (req, res, next) => {
  const token = readToken(req);
  if (!token) return next();
  try {
    const { sub } = jwt.verify(token, secret());
    req.user = await User.findById(sub).select('-password');
  } catch {
    /* invalid/expired token: treat as anonymous */
  }
  next();
};

// Rejects with 401 unless a valid token maps to an existing user.
export const requireAuth = async (req, res, next) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Please log in to continue.' });
  try {
    const { sub } = jwt.verify(token, secret());
    const user = await User.findById(sub).select('-password');
    if (!user) return res.status(401).json({ error: 'Account no longer exists.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
};
