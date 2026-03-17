const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock admin user
const mockAdmin = {
  id: '1',
  email: 'admin@bungkus.com',
  name: 'Admin User',
  role: 'admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock JWT token
const mockToken = 'mock-jwt-token-' + Date.now();

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@bungkus.com' && password === 'password123') {
    res.json({
      token: mockToken,
      user: mockAdmin
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Get current admin endpoint
app.get('/api/admin/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ' + mockToken)) {
    res.json({ user: mockAdmin });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mock backend server running on port ${PORT}`);
  console.log('Login credentials: admin@bungkus.com / password123');
});