// src/routes/contracts.js

const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const { validateDeposit } = require('../middleware/payment');
const JobService = require('../services/jobService');

// POST /balances/deposit/:userId
router.post('/deposit/:userId',getProfile, validateDeposit, async (req, res) => {
    const profile = req.profile;
    const { userId } = req.params;
  
    try {
      const result = await JobService.depositToBalance(profile, userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  
module.exports = router;
