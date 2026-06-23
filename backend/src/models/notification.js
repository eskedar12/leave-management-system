const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
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
  type: {
    type: DataTypes.ENUM('leave_request', 'leave_approved', 'leave_rejected', 'leave_updated'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  hooks: {
    afterCreate: async (notification) => {
      // You could add real-time notification logic here (WebSocket, etc.)
      console.log(`🔔 New notification created for user ${notification.userId}: ${notification.title}`);
    }
  }
});

module.exports = Notification;