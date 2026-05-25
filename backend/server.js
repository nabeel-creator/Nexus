const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const meetingRoutes = require('./routes/meetings');
const chatRoutes = require('./routes/chat');
const collaborationRoutes = require('./routes/collaboration');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/collaboration', collaborationRoutes);

// Static files (for uploaded documents)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
} else {
  console.log('No MongoDB URI found. Server starting without database connection for now.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
