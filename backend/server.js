require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors'); // 1. Import CORS
const app = express();

// 2. Allow requests from your live frontend
app.use(cors({
    origin: 'https://fitzi-final.vercel.app', // Put your exact Vercel URL here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
// ... your routes below

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const mealRoutes = require('./routes/mealRoutes');

// Mount Routes
app.use('/api', authRoutes);
app.use('/api', metricsRoutes);
app.use('/api', mealRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Fitzi API is up and running in MVC format! 🚀');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});