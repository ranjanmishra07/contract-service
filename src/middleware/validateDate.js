// src/middleware/validateDates.js

const { isValid, parseISO } = require('date-fns');

const validateDates = (req, res, next) => {
    const { start, end } = req.query;

    // Check if both start and end parameters are provided
    if (!start || !end) {
        return res.status(400).json({ error: 'Both start and end dates are required.' });
    }

    // Parse and validate the date strings
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    if (!isValid(startDate) || !isValid(endDate)) {
        return res.status(400).json({ error: 'Invalid start or end date' });
    }

    // Check if start date is before end date
    if (startDate >= endDate) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
    }

    // Add parsed dates to the request object for further use
    req.startDate = startDate;
    req.endDate = endDate;

    next();
};

module.exports = validateDates;