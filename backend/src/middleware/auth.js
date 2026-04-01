const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authMiddleware = {
  // Generate JWT token
  generateToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  // Verify JWT token middleware
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token.'
      });
    }
  },

  // Admin role check middleware
  requireAdmin: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }
    next();
  },

  // Validate user credentials
  validateCredentials: async (email, password) => {
    try {
      const user = await db.get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (!user) {
        return { valid: false, error: 'User not found' };
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return { valid: false, error: 'Invalid password' };
      }

      return { valid: true, user };
    } catch (error) {
      console.error('Error validating credentials:', error);
      return { valid: false, error: 'Database error' };
    }
  },

  // Update last login
  updateLastLogin: async (userId) => {
    try {
      await db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }
};

module.exports = authMiddleware;