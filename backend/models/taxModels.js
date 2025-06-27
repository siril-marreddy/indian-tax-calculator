// Tax Models - Defines structures for Indian tax calculations

// Tax regime options
const TAX_REGIME = {
  OLD: 'old',
  NEW: 'new'
};

// Employee category
const EMPLOYEE_CATEGORY = {
  GENERAL: 'general',
  SENIOR_CITIZEN: 'senior_citizen', // 60-80 years
  SUPER_SENIOR_CITIZEN: 'super_senior_citizen' // 80+ years
};

// Old Regime Tax Slabs (FY 2024-25)
const OLD_REGIME_SLABS = {
  [EMPLOYEE_CATEGORY.GENERAL]: [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ],
  [EMPLOYEE_CATEGORY.SENIOR_CITIZEN]: [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ],
  [EMPLOYEE_CATEGORY.SUPER_SENIOR_CITIZEN]: [
    { min: 0, max: 500000, rate: 0 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ]
};

// New Regime Tax Slabs (FY 2024-25)
const NEW_REGIME_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 0.05 },
  { min: 600000, max: 900000, rate: 0.10 },
  { min: 900000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.20 },
  { min: 1500000, max: Infinity, rate: 0.30 }
];

// Surcharge rates
const SURCHARGE_RATES = [
  { min: 5000000, max: 10000000, rate: 0.10 },
  { min: 10000000, max: 20000000, rate: 0.15 },
  { min: 20000000, max: 50000000, rate: 0.25 },
  { min: 50000000, max: Infinity, rate: 0.37 }
];

// Standard deduction limits
const STANDARD_DEDUCTION = 50000;

// Section 80C limit
const SECTION_80C_LIMIT = 150000;

// Other deduction limits
const DEDUCTION_LIMITS = {
  '80D': { // Health insurance
    self: 25000,
    selfSenior: 50000,
    parents: 25000,
    parentsSenior: 50000,
    preventiveHealth: 5000
  },
  '80CCD1B': 50000, // Additional NPS
  '80TTA': 10000, // Savings account interest
  '80TTB': 50000, // Senior citizen savings interest
  '87A': { // Rebate
    old: { limit: 500000, rebate: 12500 },
    new: { limit: 700000, rebate: 25000 }
  }
};

// HRA exemption calculation factors
const HRA_EXEMPTION = {
  METRO_CITIES: 0.50, // 50% of basic salary
  NON_METRO_CITIES: 0.40 // 40% of basic salary
};

module.exports = {
  TAX_REGIME,
  EMPLOYEE_CATEGORY,
  OLD_REGIME_SLABS,
  NEW_REGIME_SLABS,
  SURCHARGE_RATES,
  STANDARD_DEDUCTION,
  SECTION_80C_LIMIT,
  DEDUCTION_LIMITS,
  HRA_EXEMPTION
};