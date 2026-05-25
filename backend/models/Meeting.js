const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g., "14:00"
  entrepreneurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);
