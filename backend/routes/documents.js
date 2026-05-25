const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Helper function to format size
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Upload a document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, size, filename, mimetype } = req.file;

    // Determine type string for frontend
    let typeStr = 'Document';
    if (mimetype.includes('pdf')) typeStr = 'PDF';
    else if (mimetype.includes('spreadsheet') || mimetype.includes('excel') || mimetype.includes('csv')) typeStr = 'Spreadsheet';
    else if (mimetype.includes('image')) typeStr = 'Image';

    const newDoc = new Document({
      name: originalname,
      originalName: originalname,
      type: typeStr,
      size: formatBytes(size),
      path: filename,
      // For a basic learner project, we can pass uploadedBy in body or just assume it's attached
      uploadedBy: req.body.userId || null 
    });

    await newDoc.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      document: {
        id: newDoc._id,
        name: newDoc.name,
        type: newDoc.type,
        size: newDoc.size,
        lastModified: newDoc.createdAt.toISOString().split('T')[0],
        shared: newDoc.shared,
        url: `/uploads/${newDoc.path}`
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all documents
router.get('/', async (req, res) => {
  try {
    // If filtering by user
    const query = {};
    if (req.query.userId) {
      query.uploadedBy = req.query.userId;
    }

    const docs = await Document.find(query).sort({ createdAt: -1 });
    
    // Map to frontend format
    const formattedDocs = docs.map(doc => ({
      id: doc._id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      lastModified: doc.createdAt.toISOString().split('T')[0],
      shared: doc.shared,
      url: `/uploads/${doc.path}`
    }));

    res.json(formattedDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(uploadDir, document.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
