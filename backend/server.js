require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

// 1. CORS Configuration (Allows Vercel to talk to Render)
app.use(cors({
    origin: 'https://fitzi-final.vercel.app', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// 2. Body Parsing (Limit set to 50mb to handle image uploads)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ==========================================
// ROUTES
// ==========================================

// Import Routes
const authRoutes = require('./routes/authRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const mealRoutes = require('./routes/mealRoutes');

// Mount Routes
app.use('/api', authRoutes);
app.use('/api', metricsRoutes);
app.use('/api', mealRoutes);

// Health Check Endpoint
app.get('/', (req, res) => {
  res.send('Fitzi API is up and running in MVC format! 🚀');
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});