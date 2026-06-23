const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine which dialect to use based on environment variable
const dialect = process.env.DB_DIALECT || 'mysql';

// PostgreSQL specific SSL configuration
const dialectOptions = {};
if (dialect === 'postgres' && process.env.NODE_ENV === 'production') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

// Connection pool configuration
const poolConfig = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
};

// Create sequelize instance with environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || 'leave_management_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306),
    dialect: dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: poolConfig,
    dialectOptions: dialectOptions,
    define: {
      timestamps: true,
      underscored: false
    },
    // For PostgreSQL, add timezone support
    timezone: '+00:00'
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established successfully (${dialect})`);
    return true;
  } catch (error) {
    console.error(`❌ Unable to connect to database (${dialect}):`, error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};