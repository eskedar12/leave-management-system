const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine which dialect to use based on environment variable
const dialect = process.env.DB_DIALECT || 'mysql';

// PostgreSQL specific SSL configuration.
// Neon (and most hosted Postgres) requires SSL even for local dev connections,
// so this is no longer gated behind NODE_ENV === 'production'.
const dialectOptions = {};
if (dialect === 'postgres') {
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

const sequelizeOptions = {
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
};

// Neon (and most managed Postgres hosts) give you a single connection string
// like postgresql://user:pass@host/dbname?sslmode=require. If DATABASE_URL is
// set, use it directly instead of the individual DB_* fields.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, sequelizeOptions)
  : new Sequelize(
      process.env.DB_NAME || 'leave_management_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        ...sequelizeOptions,
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306)
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

// Export sequelize directly for models
module.exports = sequelize;
module.exports.testConnection = testConnection;