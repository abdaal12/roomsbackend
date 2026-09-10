const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes     = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const leadRoutes     = require('./routes/leads');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://rooms-amber-xi.vercel.app/',
    // Add any other domains here
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE: No more static /uploads — images are on Cloudinary now

app.use('/api/auth',       authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads',      leadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
