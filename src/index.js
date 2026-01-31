// src/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');

const adminroutes = require('./router/super_admin.js');
const applicantroutes = require('./router/applicants.js');
const pocRoutes = require('./router/poc.js');  // Add this line

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
app.use('/api/admin', adminroutes);
app.use('/api/applicants', applicantroutes);
app.use('/api/poc', pocRoutes);  // Add this line

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});