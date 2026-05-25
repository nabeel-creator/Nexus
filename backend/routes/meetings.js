const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

// Schedule a meeting
router.post('/', async (req, res) => {
  try {
    const { title, date, time, entrepreneurId, investorId, notes } = req.body;
    
    const meeting = new Meeting({
      title,
      date,
      time,
      entrepreneurId,
      investorId,
      notes
    });

    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get meetings for a user
router.get('/', async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    const query = {};
    if (role === 'investor') {
      query.investorId = userId;
    } else {
      query.entrepreneurId = userId;
    }

    const meetings = await Meeting.find(query)
      .populate('entrepreneurId', 'username firstName lastName startupName avatarUrl')
      .populate('investorId', 'username firstName lastName avatarUrl')
      .sort({ date: 1 });

    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update meeting status
router.put('/:id/status', async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status },
      { new: true }
    );
    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
