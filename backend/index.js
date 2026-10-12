import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/database/connectivity.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Add it to backend/.env (see .env.example).');
  process.exit(1);
}

await connectDB();

const port = process.env.PORT || 5000;
// On Vercel the platform invokes the exported app; locally we listen ourselves.
if (!process.env.VERCEL) app.listen(port, () => console.log(`Server running on port ${port}`));

export default app;
