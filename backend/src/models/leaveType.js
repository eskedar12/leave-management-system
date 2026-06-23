const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveType = sequelize.define('LeaveType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  displayName: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      en: 'Annual Leave',
      am: 'የዓመት ፈቃድ'
    }
  },
  defaultDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  description: {
    type: DataTypes.JSON,
    allowNull: true
  },
  requiresApproval: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

module.exports = LeaveType;