// src/routes/contracts.js

const express = require('express');
const router = express.Router();
const { getProfile } = require('../middleware/getProfile');
const ContractService = require('../services/contractService');

router.get('/:id', getProfile, async (req, res) => {
  const { id } = req.params;
  const contractService = new ContractService(req.app.get('models'));
  try {
    const contract = await contractService.getContractByIdAndProfile(id, req.profile);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found or access denied' });
    }

    return res.json(contract);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Fetch all non-terminated contracts for the profile
router.get('/', getProfile, async (req, res) => {
  const contractService = new ContractService(req.app.get('models'));
  try {
    const contracts = await contractService.getContractsByProfile(req.profile);

    if (!contracts.length) {
      return res.status(404).json({ error: 'No active contracts found' });
    }

    return res.json(contracts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
