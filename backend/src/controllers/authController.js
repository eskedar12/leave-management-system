const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// Helper function to sign JWT
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, preferredLanguage: user.preferredLanguage || 'en' },
    process.env.JWT_SECRET || 'super_secret_key_12345',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 1. Register User - WITH DEFAULT LEAVE BALANCE
const register = async (req, res) => {
  try {
    const { fullName, username, email, password, department, phone } = req.body;

    // Validate request inputs
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, username, email, and password.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      return res.status(400).json({
        success: false,
        message: `${field} is already registered.`
      });
    }

    // Check if this is the first user (make them admin)
    const userCount = await User.count();
    const role = userCount === 0 ? 'admin' : 'employee';

   // DEFAULT LEAVE BALANCE FOR NEW USERS 
const defaultLeaveBalance = {
  annual: 30,
  sick: 30,
  emergency: 30,
  maternity: 30,
  paternity: 30,
  compassionate: 30,
  unpaid: 30
};

    // Create new user with default leave balance
    const newUser = await User.create({
      fullName,
      username,
      email,
      password,
      role: role,
      preferredLanguage: 'en', // Default to English
      department: department || null,
      position: null, // Default null
      phone: phone || null,
      joinDate: null, // Default null
      leaveBalance: defaultLeaveBalance
    });

    // Generate JWT Token
    const token = signToken(newUser);

    // Return user details without password
    const userResponse = {
      id: newUser.id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      preferredLanguage: newUser.preferredLanguage || 'en',
      department: newUser.department,
      position: newUser.position,
      phone: newUser.phone,
      joinDate: newUser.joinDate,
      leaveBalance: newUser.leaveBalance,
      createdAt: newUser.createdAt
    };

    return res.status(201).json({
      success: true,
      message: role === 'admin' ? 'Registration successful. You are the first user and have been granted admin privileges.' : 'Registration successful.',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during registration.'
    });
  }
};

// 2. Login User
const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username or email, and password.'
      });
    }

    // Find user by either email or username
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.'
      });
    }

    // Ensure leaveBalance exists
    if (!user.leaveBalance) {
      user.leaveBalance = {
        annual: 20,
        sick: 10,
        emergency: 5,
        maternity: 0,
        paternity: 0,
        compassionate: 0,
        unpaid: 0
      };
      await user.save();
    }

    // Generate token
    const token = signToken(user);

    // Return user details
    const userResponse = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage || 'en',
      department: user.department || null,
      position: user.position || null,
      phone: user.phone || null,
      joinDate: user.joinDate || null,
      leaveBalance: user.leaveBalance,
      createdAt: user.createdAt
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login.'
    });
  }
};

// 3. Get User Profile
const getProfile = async (req, res) => {
  try {
    // Ensure leaveBalance exists
    if (!req.user.leaveBalance) {
      req.user.leaveBalance = {
        annual: 20,
        sick: 10,
        emergency: 5,
        maternity: 0,
        paternity: 0,
        compassionate: 0,
        unpaid: 0
      };
      await req.user.save();
    }

    const userResponse = {
      id: req.user.id,
      fullName: req.user.fullName,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      preferredLanguage: req.user.preferredLanguage || 'en',
      department: req.user.department || null,
      position: req.user.position || null,
      phone: req.user.phone || null,
      joinDate: req.user.joinDate || null,
      leaveBalance: req.user.leaveBalance,
      createdAt: req.user.createdAt
    };

    return res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile.'
    });
  }
};

// 4. Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, username, email, password, department, phone } = req.body;
    const user = req.user;

    // Check uniqueness if username is changing
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken.'
        });
      }
      user.username = username;
    }

    // Check uniqueness if email is changing
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken.'
        });
      }
      user.email = email;
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (password) user.password = password;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    // Re-sign token
    const token = signToken(user);

    const userResponse = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage || 'en',
      department: user.department,
      position: user.position,
      phone: user.phone,
      joinDate: user.joinDate,
      leaveBalance: user.leaveBalance,
      createdAt: user.createdAt
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while updating profile.'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};