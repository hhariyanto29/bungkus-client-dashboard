const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

router.use(auth.verifyToken);

// Get all shipments
router.get('/', auth.requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT s.*, o.order_number, c.name as client_name, c.company_name
      FROM shipments s
      LEFT JOIN orders o ON s.order_id = o.id
      LEFT JOIN clients c ON o.client_id = c.id
    `;
    const params = [];
    if (status) { query += ' WHERE s.status = ?'; params.push(status); }
    query += ' ORDER BY s.created_at DESC';

    const shipments = await db.query(query, params);
    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch shipments' });
  }
});

// Get shipments for an order
router.get('/order/:orderId', async (req, res) => {
  try {
    const shipments = await db.query(
      'SELECT * FROM shipments WHERE order_id = ? ORDER BY created_at DESC',
      [req.params.orderId]
    );
    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (error) {
    console.error('Get order shipments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch shipments' });
  }
});

// Get single shipment
router.get('/:id', async (req, res) => {
  try {
    const shipment = await db.get(`
      SELECT s.*, o.order_number, c.name as client_name, c.company_name, c.address as client_address
      FROM shipments s
      LEFT JOIN orders o ON s.order_id = o.id
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });
    res.json({ success: true, data: shipment });
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch shipment' });
  }
});

// Create shipment
router.post('/', async (req, res) => {
  try {
    const { order_id, tracking_number, courier, service_type, estimated_delivery, shipping_address, notes } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    const order = await db.get('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Get client address as default shipping address
    const client = await db.get('SELECT address FROM clients WHERE id = ?', [order.client_id]);
    const address = shipping_address || (client ? client.address : null);

    const result = await db.run(
      `INSERT INTO shipments (order_id, tracking_number, courier, service_type, status, estimated_delivery, shipping_address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_id, tracking_number || null, courier || null, service_type || null, 'pending', estimated_delivery || null, address, notes || null]
    );

    // Update order production_status to shipped if currently ready
    if (order.production_status === 'ready') {
      await db.run('UPDATE orders SET production_status = ? WHERE id = ?', ['shipped', order_id]);
    }

    const shipment = await db.get('SELECT * FROM shipments WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ success: false, error: 'Failed to create shipment' });
  }
});

// Update shipment
router.put('/:id', async (req, res) => {
  try {
    const { tracking_number, courier, service_type, estimated_delivery, shipping_address, notes } = req.body;

    const existing = await db.get('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Shipment not found' });

    await db.run(
      `UPDATE shipments SET tracking_number = ?, courier = ?, service_type = ?,
       estimated_delivery = ?, shipping_address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        tracking_number || existing.tracking_number,
        courier || existing.courier,
        service_type || existing.service_type,
        estimated_delivery || existing.estimated_delivery,
        shipping_address || existing.shipping_address,
        notes !== undefined ? notes : existing.notes,
        req.params.id
      ]
    );

    const updated = await db.get('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Shipment updated successfully', data: updated });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({ success: false, error: 'Failed to update shipment' });
  }
});

// Update shipment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'picked_up', 'in_transit', 'delivered'];
    if (!status || !valid.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${valid.join(', ')}` });
    }

    const existing = await db.get('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Shipment not found' });

    const actualDelivery = status === 'delivered' ? new Date().toISOString() : existing.actual_delivery;

    await db.run(
      'UPDATE shipments SET status = ?, actual_delivery = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, actualDelivery, req.params.id]
    );

    // If delivered, update order production_status
    if (status === 'delivered') {
      await db.run('UPDATE orders SET production_status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['delivered', existing.order_id]);
    }

    const updated = await db.get('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: `Shipment status updated to ${status}`, data: updated });
  } catch (error) {
    console.error('Update shipment status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update shipment status' });
  }
});

// Delete shipment
router.delete('/:id', auth.requireAdmin, async (req, res) => {
  try {
    const existing = await db.get('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Shipment not found' });

    await db.run('DELETE FROM shipments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete shipment' });
  }
});

module.exports = router;
