// Tax Routes - API endpoints for tax calculations

const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');

// Route: Calculate tax with comparison between regimes
// POST /api/tax/calculate
router.post('/calculate', taxController.calculateTax);

// Route: Get tax slabs and deduction limits
// GET /api/tax/info
router.get('/info', taxController.getTaxInfo);

// Route: Calculate tax for specific regime
// POST /api/tax/calculate/:regime (old/new)
router.post('/calculate/:regime', taxController.calculateRegimeTax);

// Route: Get calculation history by PAN
// GET /api/tax/history/:pan
router.get('/history/:pan', taxController.getCalculationHistory);

// Route: Get calculation by ID
// GET /api/tax/calculation/:id
router.get('/calculation/:id', taxController.getCalculationById);

// Route: Get recent calculations
// GET /api/tax/recent
router.get('/recent', taxController.getRecentCalculations);

module.exports = router;