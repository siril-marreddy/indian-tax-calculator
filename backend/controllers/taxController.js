// Tax Controller - Handles API requests for tax calculations

const TaxCalculator = require('../utils/taxCalculator');
const { TaxCalculation } = require('../models');

// Validate employee data
const validateEmployeeData = (data) => {
  const errors = [];
  
  // Required fields validation
  if (!data.name || data.name.trim() === '') {
    errors.push('Employee name is required');
  }
  
  if (!data.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan)) {
    errors.push('Valid PAN number is required (Format: ABCDE1234F)');
  }
  
  if (!data.age || data.age < 18 || data.age > 100) {
    errors.push('Valid age between 18 and 100 is required');
  }
  
  if (!data.income || !data.income.basicSalary || data.income.basicSalary < 0) {
    errors.push('Basic salary must be a positive number');
  }
  
  return errors;
};

// Calculate tax for given employee data
const calculateTax = async (req, res) => {
  try {
    const employeeData = req.body;
    
    // Validate input data
    const validationErrors = validateEmployeeData(employeeData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }
    
    // Perform tax calculation
    const calculator = new TaxCalculator(employeeData);
    const result = calculator.calculate();
    
    // Save calculation to database
    try {
      await TaxCalculation.create({
        employeeName: employeeData.name,
        pan: employeeData.pan,
        age: employeeData.age,
        employeeCategory: result.employeeDetails.category,
        grossIncome: result.oldRegime.grossIncome,
        basicSalary: employeeData.income.basicSalary,
        oldRegimeTax: result.oldRegime.totalTax,
        newRegimeTax: result.newRegime.totalTax,
        recommendedRegime: result.recommendation,
        taxSavings: result.savings,
        calculationData: result,
        email: employeeData.email || null,
        phone: employeeData.phone || null
      });
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // Continue even if save fails
    }
    
    // Return calculation results
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Tax calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate tax',
      message: error.message
    });
  }
};

// Get tax slabs and limits information
const getTaxInfo = async (req, res) => {
  try {
    const {
      OLD_REGIME_SLABS,
      NEW_REGIME_SLABS,
      DEDUCTION_LIMITS,
      SECTION_80C_LIMIT,
      STANDARD_DEDUCTION
    } = require('../models/taxModels');
    
    res.json({
      success: true,
      data: {
        oldRegimeSlabs: OLD_REGIME_SLABS,
        newRegimeSlabs: NEW_REGIME_SLABS,
        deductionLimits: DEDUCTION_LIMITS,
        section80CLimit: SECTION_80C_LIMIT,
        standardDeduction: STANDARD_DEDUCTION
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tax information'
    });
  }
};

// Calculate tax for specific regime
const calculateRegimeTax = async (req, res) => {
  try {
    const { regime } = req.params;
    const employeeData = req.body;
    
    // Validate regime
    if (!['old', 'new'].includes(regime)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid regime. Must be "old" or "new"'
      });
    }
    
    // Validate input data
    const validationErrors = validateEmployeeData(employeeData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }
    
    // Calculate tax for specific regime
    const calculator = new TaxCalculator(employeeData);
    const result = regime === 'old' 
      ? calculator.calculateOldRegimeTax()
      : calculator.calculateNewRegimeTax();
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Regime tax calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate regime tax',
      message: error.message
    });
  }
};

// Get calculation history for a PAN
const getCalculationHistory = async (req, res) => {
  try {
    const { pan } = req.params;
    
    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      return res.status(400).json({
        success: false,
        error: 'Valid PAN number is required'
      });
    }
    
    const calculations = await TaxCalculation.findAll({
      where: { pan },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json({
      success: true,
      data: calculations,
      count: calculations.length
    });
    
  } catch (error) {
    console.error('Error fetching calculation history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch calculation history'
    });
  }
};

// Get calculation by ID
const getCalculationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const calculation = await TaxCalculation.findByPk(id);
    
    if (!calculation) {
      return res.status(404).json({
        success: false,
        error: 'Calculation not found'
      });
    }
    
    res.json({
      success: true,
      data: calculation
    });
    
  } catch (error) {
    console.error('Error fetching calculation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch calculation'
    });
  }
};

// Get recent calculations
const getRecentCalculations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const calculations = await TaxCalculation.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      attributes: [
        'id', 'employeeName', 'pan', 'grossIncome', 
        'oldRegimeTax', 'newRegimeTax', 'recommendedRegime', 
        'taxSavings', 'createdAt'
      ]
    });
    
    res.json({
      success: true,
      data: calculations,
      count: calculations.length
    });
    
  } catch (error) {
    console.error('Error fetching recent calculations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent calculations'
    });
  }
};

module.exports = {
  calculateTax,
  getTaxInfo,
  calculateRegimeTax,
  getCalculationHistory,
  getCalculationById,
  getRecentCalculations
};