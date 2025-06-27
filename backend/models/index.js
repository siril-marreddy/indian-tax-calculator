// Model exports and database initialization

const { sequelize } = require('../config/database');
const TaxCalculation = require('./TaxCalculation');

// Initialize database and create tables
const initializeDatabase = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database models:', error);
  }
};

module.exports = {
  sequelize,
  TaxCalculation,
  initializeDatabase
};