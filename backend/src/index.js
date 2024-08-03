const express = require('express');
console.log(require.resolve('./database/connectivity'));

const connectDB = require('./database/connectivity');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // for parsing application/json

// Routes
app.get('/', (req, res) => res.send('Hello World!'));

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
