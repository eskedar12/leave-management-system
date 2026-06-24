const { LeaveRequest, User, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('./notificationController');

// Helper function to calculate working days (excluding weekends and holidays)
const calculateWorkingDays = (startDate, endDate, calendarSystem) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let days = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Exclude weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 6 && dayOfWeek !== 0) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
};

// 1. Submit Leave Request (Employee Feature)
const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, calendarSystem } = req.body;
    const userId = req.user.id;

    console.log('========================================');
    console.log('📝 NEW LEAVE REQUEST');
    console.log('Leave Type:', leaveType);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    console.log('User ID:', userId);
    console.log('========================================');

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason.'
      });
    }

    // Validate date sequence
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after the end date.'
      });
    }

    // Calculate working days
    const daysRequested = calculateWorkingDays(startDate, endDate, calendarSystem || 'GC');
    console.log('Days Requested:', daysRequested);

    // Get user
    const user = await User.findByPk(userId);
    console.log('User found:', user.fullName);
    console.log('Remaining days:', user.remainingDays);

    // Check if user has enough balance
    if (daysRequested > user.remainingDays) {
      console.log('❌ INSUFFICIENT BALANCE!');
      console.log('   Requested:', daysRequested);
      console.log('   Available:', user.remainingDays);
      
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. You have ${user.remainingDays} days remaining.`
      });
    }

    console.log('✅ Balance is sufficient!');

    // Create the leave request
    const newRequest = await LeaveRequest.create({
      userId,
      leaveType,
      startDate,
      endDate,
      daysRequested: daysRequested || 1,
      reason,
      status: 'pending',
      calendarSystem: calendarSystem || 'GC'
    });

    console.log('✅ Leave request created successfully!');
    console.log('Request ID:', newRequest.id);

    // 🔔 Send notification to all admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    const employee = req.user;
    
    for (const admin of admins) {
      await createNotification(
        admin.id,
        'leave_request',
        `📝 New Leave Request from ${employee.fullName}`,
        `${employee.fullName} has requested ${daysRequested} days of ${leaveType} leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}. Reason: ${reason}`,
        `/admin/requests/${newRequest.id}`,
        {
          requestId: newRequest.id,
          employeeId: employee.id,
          employeeName: employee.fullName,
          leaveType: leaveType,
          daysRequested: daysRequested
        }
      );
    }

    // 🔔 Send notification to the employee (confirmation)
    await createNotification(
      userId,
      'leave_request',
      `✅ Leave Request Submitted`,
      `Your ${leaveType} leave request for ${daysRequested} days has been submitted successfully. Waiting for admin approval.`,
      `/dashboard`,
      {
        requestId: newRequest.id,
        status: 'pending'
      }
    );

    console.log('========================================');

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      request: newRequest,
      remainingBalance: user.remainingDays - daysRequested
    });
  } catch (error) {
    console.error('❌ Create Leave Request Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while submitting the leave request.'
    });
  }
};

// 2. View Own Requests (Employee Feature)
const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await LeaveRequest.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get My Requests Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your leave requests.'
    });
  }
};

// 3. View All Leave Requests with Filters & Search (Admin Feature)
const getAllRequests = async (req, res) => {
  try {
    const { status, employeeName } = req.query;
    
    const leaveWhere = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      leaveWhere.status = status;
    }

    const userWhere = {};
    if (employeeName) {
      userWhere.fullName = {
        [Op.like]: `%${employeeName}%`
      };
    }

    const requests = await LeaveRequest.findAll({
      where: leaveWhere,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'username', 'email', 'department', 'phone', 'remainingDays'],
          where: employeeName ? userWhere : undefined
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get All Requests Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching all leave requests.'
    });
  }
};

// 4. Resolve Leave Request (Admin Feature) - FIXED
const resolveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, managerComment } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: "approved" or "rejected".'
      });
    }

    const request = await LeaveRequest.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'remainingDays'] }]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.'
      });
    }

    const admin = req.user;

    // ✅ FIX: Get days requested (default to 1 if undefined)
    const daysToDeduct = request.daysRequested || 1;

    console.log('📊 Resolving request:', {
      requestId: request.id,
      leaveType: request.leaveType,
      daysRequested: daysToDeduct,
      user: request.user.fullName,
      currentRemainingDays: request.user.remainingDays
    });

    if (status === 'approved') {
      const user = request.user;
      
      // Check if user has enough remaining days
      if (daysToDeduct > user.remainingDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. User has ${user.remainingDays} days left.`
        });
      }

      // ✅ DEDUCT EXACTLY THE DAYS REQUESTED (ensure it's a number)
      const newRemainingDays = Number(user.remainingDays) - Number(daysToDeduct);
      user.remainingDays = newRemainingDays;
      await user.save();
      
      console.log(`✅ Remaining days updated: ${user.fullName} ${user.remainingDays + daysToDeduct} -> ${user.remainingDays} (deducted ${daysToDeduct} days)`);

      // 🔔 Send notification to employee - Approved
      await createNotification(
        user.id,
        'leave_approved',
        `✅ Leave Request Approved`,
        `Your ${request.leaveType} leave request for ${daysToDeduct} days has been approved by ${admin.fullName}. ${managerComment ? `Comment: ${managerComment}` : ''}`,
        `/dashboard`,
        {
          requestId: request.id,
          approvedBy: admin.fullName,
          daysRequested: daysToDeduct,
          leaveType: request.leaveType
        }
      );
    } else {
      // 🔔 Send notification to employee - Rejected
      await createNotification(
        request.user.id,
        'leave_rejected',
        `❌ Leave Request Rejected`,
        `Your ${request.leaveType} leave request for ${daysToDeduct} days has been rejected by ${admin.fullName}. ${managerComment ? `Comment: ${managerComment}` : ''}`,
        `/dashboard`,
        {
          requestId: request.id,
          rejectedBy: admin.fullName,
          daysRequested: daysToDeduct,
          leaveType: request.leaveType
        }
      );
    }

    request.status = status;
    request.managerComment = managerComment || null;
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Leave request has been ${status}.`,
      request
    });
  } catch (error) {
    console.error('❌ Resolve Request Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while updating the leave request status.'
    });
  }
};

// 5. Get Dashboard Statistics (Admin Feature)
const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await User.count({ where: { role: 'employee' } });

    const totalRequests = await LeaveRequest.count();
    const pendingRequests = await LeaveRequest.count({ where: { status: 'pending' } });
    const approvedRequests = await LeaveRequest.count({ where: { status: 'approved' } });
    const rejectedRequests = await LeaveRequest.count({ where: { status: 'rejected' } });

    const today = new Date().toISOString().split('T')[0];
    const employeesOnLeaveToday = await LeaveRequest.findAll({
      where: {
        status: 'approved',
        startDate: { [Op.lte]: today },
        endDate: { [Op.gte]: today }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'department', 'phone']
        }
      ]
    });

    const requestsByType = await LeaveRequest.findAll({
      attributes: ['leaveType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['leaveType']
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        employeesOnLeaveToday: employeesOnLeaveToday.map(r => r.user),
        requestsByType
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while compiling statistics.'
    });
  }
};

// 6. View All Employees (Admin Feature)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      where: { role: 'employee' },
      attributes: ['id', 'fullName', 'username', 'email', 'department', 'phone', 'role', 'remainingDays', 'createdAt'],
      order: [['fullName', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      employees
    });
  } catch (error) {
    console.error('Get Employees Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving employee list.'
    });
  }
};

// 7. Get Leave Balance for a user
const getLeaveBalance = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      remainingDays: user.remainingDays || 30
    });
  } catch (error) {
    console.error('Get Leave Balance Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching leave balance.'
    });
  }
};

// 8. Get employees on leave today
const getEmployeesOnLeaveToday = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const employees = await LeaveRequest.findAll({
      where: {
        status: 'approved',
        startDate: { [Op.lte]: today },
        endDate: { [Op.gte]: today }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'department', 'phone', 'email']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      employees: employees.map(r => ({
        ...r.user.toJSON(),
        leaveRequest: {
          id: r.id,
          leaveType: r.leaveType,
          startDate: r.startDate,
          endDate: r.endDate
        }
      }))
    });
  } catch (error) {
    console.error('Get Employees On Leave Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching employees on leave.'
    });
  }
};

// 9. Check if a date is a holiday
const checkHoliday = async (req, res) => {
  try {
    const { date, calendarSystem } = req.body;
    return res.status(200).json({
      success: true,
      isHoliday: false,
      message: 'Holiday checking is not fully implemented yet.'
    });
  } catch (error) {
    console.error('Check Holiday Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while checking holiday.'
    });
  }
};

module.exports = {
  createLeaveRequest,
  getMyRequests,
  getAllRequests,
  resolveRequest,
  getDashboardStats,
  getAllEmployees,
  getLeaveBalance,
  getEmployeesOnLeaveToday,
  checkHoliday
};