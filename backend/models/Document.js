const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String, required: true }, // e.g., '2.4 MB'
  path: { type: String, required: true },
  shared: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
