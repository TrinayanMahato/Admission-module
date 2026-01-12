const express = require('express');
const app = express();
import mongoose from 'mongoose';
import { connectDB } from './db.js';

connectDB();

// Middleware to parse JSON (Standard for modern APIs)
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});