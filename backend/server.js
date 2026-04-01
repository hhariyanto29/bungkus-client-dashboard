const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3004'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting for authenticated API
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Stricter rate limiting for public portal
const portalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many requests. Please try again later.'
});

app.use('/api/auth', apiLimiter);
app.use('/api/clients', apiLimiter);
app.use('/api/orders', apiLimiter);
app.use('/api/invoices', apiLimiter);
app.use('/api/shipments', apiLimiter);
app.use('/api/qr', apiLimiter);
app.use('/api/portal', portalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Bungkus Backend API',
    version: '2.0.0',
    database: 'SQLite'
  });
});

// API Routes (authenticated)
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/clients', require('./src/routes/clientRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/invoices', require('./src/routes/invoiceRoutes'));
app.use('/api/shipments', require('./src/routes/shipmentRoutes'));
app.use('/api/qr', require('./src/routes/qrRoutes'));

// Public Portal Routes (no authentication - accessed via QR scan)
app.use('/api/portal', require('./src/routes/portalRoutes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Bungkus Backend Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS Origins: localhost:3000, localhost:3002`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📦 Admin API: http://localhost:${PORT}/api`);
    console.log(`🔓 Portal API: http://localhost:${PORT}/api/portal`);
  });
}

module.exports = app;
