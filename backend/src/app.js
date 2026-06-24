const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notifications', notificationRoutes);

// ============================================
// ✅ TEST ROUTES - Add these
// ============================================

// Test endpoint to check if API is working
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      leaves: {
        create: 'POST /api/leaves',
        myRequests: 'GET /api/leaves/my-requests',
        allRequests: 'GET /api/leaves (admin only)'
      },
      notifications: {
        getAll: 'GET /api/notifications',
        unreadCount: 'GET /api/notifications/unread-count'
      }
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LMS Backend is running!',
    version: '1.0.0',
    endpoints: {
      test: '/api/test',
      auth: '/api/auth',
      leaves: '/api/leaves',
      notifications: '/api/notifications'
    }
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('🔄 Starting server...');
  
  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Sync database
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');
  } catch (error) {
    console.error('❌ Failed to sync database:', error.message);
    process.exit(1);
  }

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
    console.log(`📍 Root: http://localhost:${PORT}/`);
  });
};

startServer();