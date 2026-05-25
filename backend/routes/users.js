const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');

// Get user profile
router.get('/profile/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Map to frontend expected format
    const userData = {
      id: user._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`,
      bio: user.bio,
      isOnline: true,
      startupName: user.startupName,
      industry: user.industry,
      location: user.location,
      foundedYear: user.foundedYear,
      teamSize: user.teamSize,
      pitchSummary: user.pitchSummary,
      fundingNeeded: user.fundingNeeded,
      investmentFocus: user.investmentFocus,
      portfolioSize: user.portfolioSize,
      typicalTicketSize: user.typicalTicketSize,
      investmentInterests: user.investmentInterests,
      investmentStage: user.investmentStage,
      portfolioCompanies: user.portfolioCompanies,
      totalInvestments: user.totalInvestments,
      minimumInvestment: user.minimumInvestment,
      maximumInvestment: user.maximumInvestment,
      createdAt: user.createdAt
    };

    res.json(userData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    const fieldsToUpdate = [
      'firstName', 'lastName', 'bio', 'startupName', 'industry', 
      'location', 'foundedYear', 'teamSize', 'pitchSummary', 'fundingNeeded',
      'investmentFocus', 'portfolioSize', 'typicalTicketSize',
      'investmentInterests', 'investmentStage', 'portfolioCompanies',
      'totalInvestments', 'minimumInvestment', 'maximumInvestment'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get all users (useful for listing entrepreneurs for investors)
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;

    const users = await User.find(query).select('-password');
    const usersData = users.map(user => ({
      id: user._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`,
      bio: user.bio,
      isOnline: true,
      startupName: user.startupName,
      industry: user.industry,
      location: user.location,
      pitchSummary: user.pitchSummary,
      fundingNeeded: user.fundingNeeded,
      investmentFocus: user.investmentFocus,
      portfolioSize: user.portfolioSize
    }));

    res.json(usersData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get all entrepreneurs
router.get('/entrepreneurs', async (req, res) => {
  try {
    const entrepreneurs = await User.find({ role: 'entrepreneur' }).select('-password');
    const entrepreneursData = entrepreneurs.map(user => ({
      id: user._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`,
      bio: user.bio,
      isOnline: true,
      startupName: user.startupName,
      industry: user.industry,
      location: user.location,
      foundedYear: user.foundedYear,
      teamSize: user.teamSize,
      pitchSummary: user.pitchSummary,
      fundingNeeded: user.fundingNeeded
    }));

    res.json(entrepreneursData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
