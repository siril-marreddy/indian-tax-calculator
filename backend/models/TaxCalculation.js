// TaxCalculation Model - Stores tax calculation history

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaxCalculation = sequelize.define('TaxCalculation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Employee Information
  employeeName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'employee_name'
  },
  pan: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      is: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 18,
      max: 100
    }
  },
  employeeCategory: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'employee_category'
  },
  
  // Income Details
  grossIncome: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'gross_income'
  },
  basicSalary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'basic_salary'
  },
  
  // Tax Calculation Results
  oldRegimeTax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'old_regime_tax'
  },
  newRegimeTax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'new_regime_tax'
  },
  recommendedRegime: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'recommended_regime'
  },
  taxSavings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'tax_savings'
  },
  
  // Store complete calculation data as JSON
  calculationData: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'calculation_data'
  },
  
  // Optional fields
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  financialYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-25',
    field: 'financial_year'
  }
}, {
  tableName: 'tax_calculations',
  indexes: [
    {
      fields: ['pan']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['employee_name']
    }
  ]
});

module.exports = TaxCalculation;