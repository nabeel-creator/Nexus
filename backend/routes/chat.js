const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const formatUser = (user) => ({
  id: user._id.toString(),
  name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
  email: user.email,
  avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`,
  role: user.role,
  bio: user.bio,
  isOnline: true,
  createdAt: user.createdAt
});

const formatMessage = (message) => ({
  id: message._id.toString(),
  senderId: message.senderId.toString(),
  receiverId: message.receiverId.toString(),
  content: message.content,
  timestamp: message.createdAt.toISOString(),
  isRead: message.isRead
});

router.get('/conversations', async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId },
        { receiverId: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'firstName lastName username avatarUrl role bio createdAt')
      .populate('receiverId', 'firstName lastName username avatarUrl role bio createdAt');

    const conversationMap = new Map();

    messages.forEach((message) => {
      const sender = message.senderId;
      const receiver = message.receiverId;
      const partner = sender._id.toString() === currentUserId ? receiver : sender;
      const partnerId = partner._id.toString();
      const existing = conversationMap.get(partnerId);
      const formattedMessage = formatMessage(message);
      const conversationData = {
        id: `conv-${currentUserId}-${partnerId}`,
        participants: [currentUserId, partnerId],
        partner: formatUser(partner),
        lastMessage: formattedMessage,
        updatedAt: message.createdAt.toISOString()
      };

      if (!existing || new Date(conversationData.updatedAt) > new Date(existing.updatedAt)) {
        conversationMap.set(partnerId, conversationData);
      }
    });

    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.json(conversations);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:partnerId/messages', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { partnerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'Invalid partner ID' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: partnerId },
        { senderId: partnerId, receiverId: currentUserId }
      ]
    })
      .sort({ createdAt: 1 });

    res.json(messages.map(formatMessage));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:partnerId/messages', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { partnerId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'Invalid partner ID' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const partner = await User.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const message = new Message({
      senderId: currentUserId,
      receiverId: partnerId,
      content: content.trim()
    });

    await message.save();

    res.status(201).json(formatMessage(message));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
