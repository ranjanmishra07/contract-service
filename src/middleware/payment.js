const { body, param, validationResult } = require('express-validator');

// Validation middleware for the payment request
const validatePayment = [
    param('job_id').isInt().withMessage('Job ID must be an integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateDeposit = [
    param('userId').isInt().withMessage('User ID must be an integer'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];

module.exports = { validatePayment, validateDeposit };