const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Apply authentication middleware to all routes
router.use(auth.verifyToken);
router.use(auth.requireAdmin);

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await db.query(`
      SELECT * FROM clients 
      ORDER BY join_date DESC
    `);

    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients'
    });
  }
});

// Get single client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await db.get(
      'SELECT * FROM clients WHERE id = ?',
      [req.params.id]
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Get client's orders
    const orders = await db.query(
      'SELECT * FROM orders WHERE client_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.params.id]
    );

    // Get client's QR codes
    const qrCodes = await db.query(
      'SELECT * FROM qr_codes WHERE client_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...client,
        orders,
        qrCodes
      }
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client'
    });
  }
});

// Create new client
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, location, tables, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const result = await db.run(
      `INSERT INTO clients (name, email, phone, location, tables, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, location || null, tables || 0, status || 'active']
    );

    const newClient = await db.get(
      'SELECT * FROM clients WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: newClient
    });
  } catch (error) {
    console.error('Create client error:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create client'
    });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, location, tables, status, revenue } = req.body;

    // Check if client exists
    const existingClient = await db.get(
      'SELECT * FROM clients WHERE id = ?',
      [req.params.id]
    );

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Update client
    await db.run(
      `UPDATE clients 
       SET name = ?, email = ?, phone = ?, location = ?, tables = ?, status = ?, revenue = ?
       WHERE id = ?`,
      [
        name || existingClient.name,
        email || existingClient.email,
        phone || existingClient.phone,
        location || existingClient.location,
        tables || existingClient.tables,
        status || existingClient.status,
        revenue || existingClient.revenue,
        req.params.id
      ]
    );

    const updatedClient = await db.get(
      'SELECT * FROM clients WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient
    });
  } catch (error) {
    console.error('Update client error:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update client'
    });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    // Check if client exists
    const existingClient = await db.get(
      'SELECT * FROM clients WHERE id = ?',
      [req.params.id]
    );

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Delete client's orders and QR codes first (cascade)
    await db.run('DELETE FROM orders WHERE client_id = ?', [req.params.id]);
    await db.run('DELETE FROM qr_codes WHERE client_id = ?', [req.params.id]);

    // Delete client
    await db.run('DELETE FROM clients WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete client'
    });
  }
});

// Get client statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const clientId = req.params.id;

    // Get total orders
    const totalOrders = await db.get(
      'SELECT COUNT(*) as count FROM orders WHERE client_id = ?',
      [clientId]
    );

    // Get completed orders
    const completedOrders = await db.get(
      'SELECT COUNT(*) as count FROM orders WHERE client_id = ? AND status = "completed"',
      [clientId]
    );

    // Get total revenue
    const totalRevenue = await db.get(
      'SELECT SUM(total_amount) as total FROM orders WHERE client_id = ? AND status = "completed"',
      [clientId]
    );

    // Get active QR codes
    const activeQRCodes = await db.get(
      'SELECT COUNT(*) as count FROM qr_codes WHERE client_id = ? AND status = "active"',
      [clientId]
    );

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders.count,
        completedOrders: completedOrders.count,
        totalRevenue: totalRevenue.total || 0,
        activeQRCodes: activeQRCodes.count,
        completionRate: totalOrders.count > 0 
          ? Math.round((completedOrders.count / totalOrders.count) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client statistics'
    });
  }
});

// Search clients
router.get('/search/:query', async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    
    const clients = await db.query(
      `SELECT * FROM clients 
       WHERE name LIKE ? OR email LIKE ? OR location LIKE ?
       ORDER BY name`,
      [query, query, query]
    );

    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Search clients error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search clients'
    });
  }
});

module.exports = router;