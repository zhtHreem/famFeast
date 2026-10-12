import rateLimit from 'express-rate-limit';

// Strip Mongo operator keys ($gt, $where, dotted paths) from user-supplied objects.
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !k.startsWith('$') && !k.includes('.'))
        .map(([k, v]) => [k, clean(v)])
    );
  }
  return value;
};

export const sanitize = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.query) {
    // req.query is a getter in newer Express versions; mutate in place.
    const cleaned = clean({ ...req.query });
    for (const k of Object.keys(req.query)) delete req.query[k];
    Object.assign(req.query, cleaned);
  }
  next();
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 600),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in a few minutes.' },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI requests are limited to 10 per minute.' },
});
