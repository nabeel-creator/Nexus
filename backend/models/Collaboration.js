const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entrepreneurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    default: "I'm interested in learning more about your startup."
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one request per investor-entrepreneur pair
collaborationSchema.index({ investorId: 1, entrepreneurId: 1 }, { unique: true });

module.exports = mongoose.model('Collaboration', collaborationSchema);
