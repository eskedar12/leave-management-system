const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token missing.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_12345');
    
    // Find the user by ID and attach to request
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    let message = 'Invalid token.';
    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired.';
    }
    
    return res.status(401).json({
      success: false,
      message
    });
  }
};

module.exports = authMiddleware;