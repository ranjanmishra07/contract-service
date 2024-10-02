const express = require('express');
const router = express.Router();
const AdminService = require('../services/adminService');
const { getProfile } = require('../middleware/getProfile');
const validateDates = require('../middleware/validateDate');
const adminService = new AdminService();

// Fetch the best profession based on earnings in the given date range
router.get('/best-profession', getProfile, validateDates, async (req, res) => {
    const { start, end } = req.query;

    try {
        // Fetch the profession that earned the most
        const bestProfession = await adminService.getBestProfession(start, end);

        return res.json(bestProfession);
    } catch (error) {
        if (error.message === 'No data found for the given date range') {
            return res.status(404).json({ error: error.message });
        }

        console.error('Error fetching best profession:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/best-clients', getProfile, validateDates, async (req, res) => {
    const { start, end } = req.query;
    const limit = parseInt(req.query.limit, 10) || 2;
    if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new Error('Limit must be an integer between 1 and 100');
    }
    try {
        const bestClients = await adminService.getBestClients(start, end, limit);
        return res.json(bestClients);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
