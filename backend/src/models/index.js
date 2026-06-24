const sequelize = require('../config/database');
const User = require('./user');
const LeaveRequest = require('./leaveRequest');
const Notification = require('./notification');
const LeaveType = require('./leaveType');

// Define Relationships
User.hasMany(LeaveRequest, {
  foreignKey: 'userId',
  as: 'leaveRequests',
  onDelete: 'CASCADE'
});

LeaveRequest.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE'
});

Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  LeaveRequest,
  Notification,
  LeaveType
};