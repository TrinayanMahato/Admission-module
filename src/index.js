// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');

const adminroutes = require('./router/super_admin.js');
const applicantroutes = require('./router/applicants.js');
const pocRoutes = require('./router/poc.js');
const authRoutes = require('./router/auth.js');
const errorHandler = require('./Middlewares/errorHandler.js');

const app = express();
const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminroutes);
app.use('/api/applicants', applicantroutes);
app.use('/api/poc', pocRoutes);

// Global Error Handler (MUST be last middleware)
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});