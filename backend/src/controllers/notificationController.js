const { Notification, User } = require('../models');
const { Op } = require('sequelize');

// Create a notification
const createNotification = async (userId, type, title, message, link = null, metadata = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      metadata,
      read: false
    });
    console.log(`🔔 Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    const where = { userId };
    if (unreadOnly === 'true') {
      where.read = false;
    }

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const unreadCount = await Notification.count({
      where: {
        userId,
        read: false
      }
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching notifications.'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while marking notification as read.'
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { read: true },
      {
        where: {
          userId,
          read: false
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while marking all notifications as read.'
    });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    await notification.destroy();

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting notification.'
    });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.count({
      where: {
        userId,
        read: false
      }
    });

    return res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching unread count.'
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};