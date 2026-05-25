const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Collaboration = require('../models/Collaboration');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.use(auth);

// Get collaboration requests for entrepreneur
router.get('/requests/received', async (req, res) => {
  try {
    const entrepreneurId = req.user.id;
    
    const requests = await Collaboration.find({ entrepreneurId })
      .populate('investorId', 'firstName lastName username avatarUrl role bio')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(req => ({
      id: req._id.toString(),
      investorId: req.investorId._id.toString(),
      investor: {
        id: req.investorId._id.toString(),
        name: `${req.investorId.firstName || ''} ${req.investorId.lastName || ''}`.trim() || req.investorId.username,
        avatarUrl: req.investorId.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.investorId.username)}&background=random`,
        role: req.investorId.role,
        bio: req.investorId.bio
      },
      entrepreneurId: req.entrepreneurId.toString(),
      message: req.message,
      status: req.status,
      createdAt: req.createdAt.toISOString()
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get collaboration requests sent by investor
router.get('/requests/sent', async (req, res) => {
  try {
    const investorId = req.user.id;
    
    const requests = await Collaboration.find({ investorId })
      .populate('entrepreneurId', 'firstName lastName username avatarUrl role bio startupName')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(req => ({
      id: req._id.toString(),
      investorId: req.investorId.toString(),
      entrepreneurId: req.entrepreneurId._id.toString(),
      entrepreneur: {
        id: req.entrepreneurId._id.toString(),
        name: `${req.entrepreneurId.firstName || ''} ${req.entrepreneurId.lastName || ''}`.trim() || req.entrepreneurId.username,
        avatarUrl: req.entrepreneurId.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.entrepreneurId.username)}&background=random`,
        role: req.entrepreneurId.role,
        bio: req.entrepreneurId.bio,
        startupName: req.entrepreneurId.startupName
      },
      message: req.message,
      status: req.status,
      createdAt: req.createdAt.toISOString()
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send collaboration request
router.post('/requests', async (req, res) => {
  try {
    const investorId = req.user.id;
    const { entrepreneurId, message } = req.body;

    if (!entrepreneurId) {
      return res.status(400).json({ message: 'Entrepreneur ID required' });
    }

    // Check if request already exists
    const existingRequest = await Collaboration.findOne({
      investorId,
      entrepreneurId
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const collaboration = new Collaboration({
      investorId,
      entrepreneurId,
      message: message || `I'm interested in learning more about your startup.`,
      status: 'pending'
    });

    await collaboration.save();

    res.status(201).json({
      id: collaboration._id.toString(),
      investorId: collaboration.investorId.toString(),
      entrepreneurId: collaboration.entrepreneurId.toString(),
      message: collaboration.message,
      status: collaboration.status,
      createdAt: collaboration.createdAt.toISOString()
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update collaboration request status
router.put('/requests/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const collaboration = await Collaboration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!collaboration) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({
      id: collaboration._id.toString(),
      investorId: collaboration.investorId.toString(),
      entrepreneurId: collaboration.entrepreneurId.toString(),
      message: collaboration.message,
      status: collaboration.status,
      createdAt: collaboration.createdAt.toISOString()
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
