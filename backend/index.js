
import 'dotenv/config';
import express from 'express'
import connectDB from './src/database/connectivity.js';
import userRoutes from './src/database/models/User/routes.js';
import RecipeRoutes from './src/database/models/Recipe/routes.js';
import CommentRoutes from './src/database/models/Comment/route.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import FormData from 'form-data';

const app = express();
const port = process.env.PORT || 5000;

connectDB();
// Apply CORS middleware globally for all routes
// Comma-separated list of allowed frontend origins (see backend/.env.example)
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json()); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Static folder for uploaded files
//app.use('/upload',express.static((path.join(__dirname,'src','database', 'models', 'upload') )));
//console.log("Static file serving at:", path.join(__dirname, 'src', 'database', 'models', 'upload'));


app.use('/api', userRoutes); 
app.use('/api', RecipeRoutes);
app.use('/api', CommentRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


app.get('/', (req, res) => res.send('Hello World!'));


app.listen(port, () => console.log(`Server running on port ${port}`));


