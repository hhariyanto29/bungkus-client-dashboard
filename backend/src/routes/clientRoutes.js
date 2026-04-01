const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

router.use(auth.verifyToken);
router.use(auth.requireAdmin);

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await db.query('SELECT * FROM clients ORDER BY join_date DESC');
    res.json({ success: true, count: clients.length, data: clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch clients' });
  }
});

// Search clients (must be before /:id)
router.get('/search/:query', async (req, res) => {
  try {
    const q = `%${req.params.query}%`;
    const clients = await db.query(
      `SELECT * FROM clients
       WHERE name LIKE ? OR company_name LIKE ? OR email LIKE ? OR location LIKE ? OR npwp LIKE ?
       ORDER BY name`,
      [q, q, q, q, q]
    );
    res.json({ success: true, count: clients.length, data: clients });
  } catch (error) {
    console.error('Search clients error:', error);
    res.status(500).json({ success: false, error: 'Failed to search clients' });
  }
});

// Get single client with orders
router.get('/:id', async (req, res) => {
  try {
    const client = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!client) return res.status(404).json({ success: false, error: 'Client not found' });

    const orders = await db.query(
      'SELECT * FROM orders WHERE client_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.params.id]
    );

    res.json({ success: true, data: { ...client, orders } });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client' });
  }
});

// Create client
router.post('/', async (req, res) => {
  try {
    const { name, company_name, email, phone, address, npwp, location, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    const result = await db.run(
      `INSERT INTO clients (name, company_name, email, phone, address, npwp, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, company_name || name, email, phone || null, address || null, npwp || null, location || null, status || 'active']
    );

    const client = await db.get('SELECT * FROM clients WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, message: 'Client created successfully', data: client });
  } catch (error) {
    console.error('Create client error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { name, company_name, email, phone, address, npwp, location, status } = req.body;

    const existing = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Client not found' });

    await db.run(
      `UPDATE clients SET name = ?, company_name = ?, email = ?, phone = ?, address = ?, npwp = ?, location = ?, status = ?
       WHERE id = ?`,
      [
        name || existing.name, company_name || existing.company_name,
        email || existing.email, phone || existing.phone,
        address || existing.address, npwp || existing.npwp,
        location || existing.location, status || existing.status,
        req.params.id
      ]
    );

    const updated = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Client updated successfully', data: updated });
  } catch (error) {
    console.error('Update client error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Client not found' });

    await db.run('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete client' });
  }
});

// Get client statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const id = req.params.id;
    const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders WHERE client_id = ?', [id]);
    const totalRevenue = await db.get('SELECT SUM(total_amount) as total FROM orders WHERE client_id = ?', [id]);
    const activeQR = await db.get('SELECT COUNT(*) as count FROM qr_codes qr JOIN orders o ON qr.order_id = o.id WHERE o.client_id = ? AND qr.is_active = 1', [id]);

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders.count,
        totalRevenue: totalRevenue.total || 0,
        activeQRCodes: activeQR.count
      }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client statistics' });
  }
});

module.exports = router;
