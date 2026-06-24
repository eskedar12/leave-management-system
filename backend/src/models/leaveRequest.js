const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'User ID is required'
      }
    }
  },
  leaveType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Leave type is required'
      }
    }
  },
  // ✅ ADD THIS FIELD
  daysRequested: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: 'Days requested must be at least 1'
      }
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Start date must be a valid date'
      },
      notEmpty: {
        msg: 'Start date is required'
      }
    }
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'End date must be a valid date'
      },
      notEmpty: {
        msg: 'End date is required'
      },
      isAfterOrEqual(value) {
        if (this.startDate && value < this.startDate) {
          throw new Error('End date must be on or after start date');
        }
      }
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Reason is required'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  managerComment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  calendarSystem: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'GC'
  }
});

module.exports = LeaveRequest;