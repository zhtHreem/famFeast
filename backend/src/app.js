import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import userRoutes from './database/models/User/routes.js';
import recipeRoutes from './database/models/Recipe/routes.js';
import commentRoutes from './database/models/Comment/route.js';
import cookbookRoutes from './database/models/Cookbook/routes.js';
import pantryRoutes from './routes/pantry.js';
import aiRoutes from './routes/ai.js';
import { sanitize, apiLimiter } from './middleware/security.js';

const app = express();
app.set('trust proxy', 1); // correct client IPs behind Vercel/other proxies (rate limiting)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Comma-separated list of allowed frontend origins (see backend/.env.example)
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));

app.use(express.json({ limit: '100kb' }));
app.use(sanitize);

app.get('/', (req, res) => res.send('FamFeast API'));
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', apiLimiter);
app.use('/api', userRoutes);
app.use('/api', recipeRoutes);
app.use('/api', commentRoutes);
app.use('/api', cookbookRoutes);
app.use('/api', pantryRoutes);
app.use('/api', aiRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 10MB).' : err.message });
  }
  if (err.message === 'Only images are allowed') return res.status(400).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large.' });
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ error: first?.message || 'Validation failed.' });
  }
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid value.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

export default app;
