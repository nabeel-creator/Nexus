const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { email, username, firstName, lastName, password, role } = req.body;

    // Basic validation
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Please provide email, username, and password' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      email,
      username,
      firstName,
      lastName,
      password: hashedPassword,
      role: role || 'entrepreneur'
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      });
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      });
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
