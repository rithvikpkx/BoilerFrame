import express from 'express';
import Url from '../models/Url.js';

const router = express.Router();

// Create a new URL
router.post('/', async (req, res) => {
  try {
    const { url, title, description } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const newUrl = new Url({
      url,
      title: title || '',
      description: description || ''
    });

    const savedUrl = await newUrl.save();
    res.status(201).json(savedUrl);
  } catch (error) {
    res.status(500).json({ message: 'Error saving URL', error: error.message });
  }
});

// Get all URLs
router.get('/', async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching URLs', error: error.message });
  }
});

// Get single URL by ID
router.get('/:id', async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json(url);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching URL', error: error.message });
  }
});

// Update URL
router.put('/:id', async (req, res) => {
  try {
    const { url, title, description } = req.body;

    const updatedUrl = await Url.findByIdAndUpdate(
      req.params.id,
      { url, title, description },
      { new: true, runValidators: true }
    );

    if (!updatedUrl) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json(updatedUrl);
  } catch (error) {
    res.status(500).json({ message: 'Error updating URL', error: error.message });
  }
});

// Delete URL
router.delete('/:id', async (req, res) => {
  try {
    const deletedUrl = await Url.findByIdAndDelete(req.params.id);

    if (!deletedUrl) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting URL', error: error.message });
  }
});

export default router;
