const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getMyRequests,
  getAllRequests,
  resolveRequest,
  getDashboardStats,
  getAllEmployees,
  getLeaveBalance,
  getEmployeesOnLeaveToday,
  checkHoliday
} = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Employee-only routes
router.post('/', authMiddleware, roleMiddleware(['employee']), createLeaveRequest);
router.get('/my-requests', authMiddleware, roleMiddleware(['employee']), getMyRequests);
router.get('/balance', authMiddleware, getLeaveBalance); // 👈 ADD THIS LINE

// Admin-only routes
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllRequests);
router.get('/stats', authMiddleware, roleMiddleware(['admin']), getDashboardStats);
router.get('/employees', authMiddleware, roleMiddleware(['admin']), getAllEmployees);
router.get('/employees-on-leave-today', authMiddleware, roleMiddleware(['admin']), getEmployeesOnLeaveToday);
router.put('/:id/resolve', authMiddleware, roleMiddleware(['admin']), resolveRequest);

// Holiday checking (both roles)
router.post('/check-holiday', authMiddleware, checkHoliday);

module.exports = router;