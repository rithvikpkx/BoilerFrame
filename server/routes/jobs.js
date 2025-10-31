const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

// GET /api/jobs/:id
// Returns job status and results (if available)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean().exec();
    if (!job) return res.status(404).json({ error: 'job not found' });
    // Return limited fields
    return res.json({ id: job._id, status: job.status, results: job.results || [] });
  } catch (err) {
    console.error('GET /api/jobs/:id error', err);
    return res.status(500).json({ error: err.message || 'internal' });
  }
});

module.exports = router;
