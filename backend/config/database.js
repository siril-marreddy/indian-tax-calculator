// Database configuration for SQLite

const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database', 'tax_calculator.db'),
  logging: false, // Set to console.log to see SQL queries
  define: {
    timestamps: true, // Add createdAt and updatedAt to all models
    underscored: true, // Use snake_case for database columns
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };