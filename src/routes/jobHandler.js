// src/routes/jobs.js

const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const {validatePayment} = require('../middleware/payment');
const JobService = require('../services/jobService');
const jobService = new JobService();

// Fetch unpaid jobs for the profile
router.get('/unpaid', getProfile, async (req, res) => {

  try {
    const unpaidJobs = await jobService.getUnpaidJobsByProfile(req.profile);

    if (!unpaidJobs.length) {
      return res.status(404).json({ error: 'No unpaid jobs found' });
    }

    return res.json(unpaidJobs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/:job_id/pay', getProfile, validatePayment, async (req, res) => {
  const { job_id } = req.params;

  try {
      const job = await jobService.payForJob(job_id, req.profile.id);
      res.status(200).json({ message: 'Payment successful', job });
  } catch (error) {
      if (error.message === 'Job not found') {
          return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Insufficient balance') {
          return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
