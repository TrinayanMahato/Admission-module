const express = require('express');
import connectDB from './config/db.js';
const app = express();
require('dotenv').config(); // This loads the variables


// Middleware to parse JSON (Standard for modern APIs)
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:process.env.port`);
});