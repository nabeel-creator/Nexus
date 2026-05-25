const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['investor', 'entrepreneur'], default: 'entrepreneur' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },

  // Entrepreneur fields
  startupName: { type: String, default: '' },
  industry: { type: String, default: '' },
  location: { type: String, default: '' },
  foundedYear: { type: String, default: '' },
  teamSize: { type: Number, default: 1 },
  pitchSummary: { type: String, default: '' },
  fundingNeeded: { type: String, default: '' },

  // Investor fields
  investmentFocus: { type: String, default: '' },
  portfolioSize: { type: Number, default: 0 },
  typicalTicketSize: { type: String, default: '' },
  investmentInterests: { type: [String], default: [] },
  investmentStage: { type: [String], default: [] },
  portfolioCompanies: { type: [String], default: [] },
  totalInvestments: { type: Number, default: 0 },
  minimumInvestment: { type: String, default: '' },
  maximumInvestment: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
