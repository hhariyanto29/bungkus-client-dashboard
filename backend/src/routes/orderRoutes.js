const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Apply authentication middleware to all routes
router.use(auth.verifyToken);

// Get order statistics (must be before /:id)
router.get('/stats/overview', auth.requireAdmin, async (req, res) => {
  try {
    const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders');
    const ordersByStatus = await db.query(`
      SELECT production_status as status, COUNT(*) as count FROM orders GROUP BY production_status
    `);
    const totalRevenue = await db.get(`
      SELECT SUM(total_amount) as total FROM orders WHERE payment_status IN ('lunas', 'dp')
    `);
    const today = new Date().toISOString().split('T')[0];
    const todaysOrders = await db.get(
      'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?', [today]
    );
    const avgOrderValue = await db.get(
      'SELECT AVG(total_amount) as average FROM orders'
    );

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders.count,
        ordersByStatus,
        totalRevenue: totalRevenue.total || 0,
        todaysOrders: todaysOrders.count,
        avgOrderValue: Math.round(avgOrderValue.average || 0)
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order statistics' });
  }
});

// Get recent orders (must be before /:id)
router.get('/recent/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const orders = await db.query(`
      SELECT o.*, c.name as client_name, c.company_name
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      ORDER BY o.created_at DESC LIMIT ?
    `, [limit]);

    // Attach items for each order
    for (const order of orders) {
      order.items = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?', [order.id]
      );
    }

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent orders' });
  }
});

// Get all orders
router.get('/', auth.requireAdmin, async (req, res) => {
  try {
    const { payment_status, production_status, client_id, start_date, end_date } = req.query;

    let query = `
      SELECT o.*, c.name as client_name, c.company_name
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (payment_status) { conditions.push('o.payment_status = ?'); params.push(payment_status); }
    if (production_status) { conditions.push('o.production_status = ?'); params.push(production_status); }
    if (client_id) { conditions.push('o.client_id = ?'); params.push(client_id); }
    if (start_date) { conditions.push('o.created_at >= ?'); params.push(start_date); }
    if (end_date) { conditions.push('o.created_at <= ?'); params.push(end_date); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY o.created_at DESC';

    const orders = await db.query(query, params);

    for (const order of orders) {
      order.items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Get single order with full details
router.get('/:id', async (req, res) => {
  try {
    const order = await db.get(`
      SELECT o.*, c.name as client_name, c.company_name, c.email as client_email,
             c.phone as client_phone, c.address as client_address, c.npwp as client_npwp
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE o.id = ?
    `, [req.params.id]);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.invoices = await db.query('SELECT * FROM invoices WHERE order_id = ?', [order.id]);
    order.shipments = await db.query('SELECT * FROM shipments WHERE order_id = ?', [order.id]);
    order.qr_codes = await db.query('SELECT id, secret_hash, is_active, expires_at, access_count, created_at FROM qr_codes WHERE order_id = ?', [order.id]);

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

// Create new order with items
router.post('/', async (req, res) => {
  try {
    const { client_id, items, discount, notes, due_date, packaging_details } = req.body;

    if (!client_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Client ID and at least one item are required'
      });
    }

    // Verify client exists
    const client = await db.get('SELECT * FROM clients WHERE id = ?', [client_id]);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Calculate pricing
    let subtotal = 0;
    for (const item of items) {
      item.total_price = (item.quantity || 1) * (item.unit_price || 0);
      subtotal += item.total_price;
    }
    const discountAmount = discount || 0;
    const taxAmount = Math.round((subtotal - discountAmount) * 0.11); // PPN 11%
    const totalAmount = subtotal - discountAmount + taxAmount;

    // Generate order number
    const date = new Date();
    const count = await db.get('SELECT COUNT(*) as c FROM orders WHERE created_at >= ?', [
      `${date.getFullYear()}-01-01`
    ]);
    const seq = String((count.c || 0) + 1).padStart(3, '0');
    const orderNumber = `ORD-${date.getFullYear()}-${seq}`;

    // Insert order
    const result = await db.run(
      `INSERT INTO orders (order_number, client_id, subtotal, discount, tax_amount, total_amount, notes, due_date, packaging_details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, client_id, subtotal, discountAmount, taxAmount, totalAmount, notes || null, due_date || null, packaging_details || null]
    );

    // Insert order items
    for (const item of items) {
      await db.run(
        `INSERT INTO order_items (order_id, item_name, description, material, size, print_type, quantity, unit_price, total_price, specifications)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [result.id, item.item_name, item.description || null, item.material || null, item.size || null, item.print_type || null, item.quantity || 1, item.unit_price || 0, item.total_price, item.specifications ? JSON.stringify(item.specifications) : null]
      );
    }

    // Update client revenue
    await db.run(
      'UPDATE clients SET revenue = revenue + ? WHERE id = ?',
      [totalAmount, client_id]
    );

    const newOrder = await db.get('SELECT * FROM orders WHERE id = ?', [result.id]);
    newOrder.items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// Calculate pricing for items (preview before saving)
router.post('/calculate', async (req, res) => {
  try {
    const { items, discount } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items array is required' });
    }

    let subtotal = 0;
    const calculated = items.map(item => {
      const total = (item.quantity || 1) * (item.unit_price || 0);
      subtotal += total;
      return { ...item, total_price: total };
    });

    const discountAmount = discount || 0;
    const taxAmount = Math.round((subtotal - discountAmount) * 0.11);
    const totalAmount = subtotal - discountAmount + taxAmount;

    res.json({
      success: true,
      data: {
        items: calculated,
        subtotal,
        discount: discountAmount,
        tax_amount: taxAmount,
        tax_rate: 0.11,
        total_amount: totalAmount
      }
    });
  } catch (error) {
    console.error('Calculate pricing error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate pricing' });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const { client_id, items, discount, notes, due_date, packaging_details, payment_status, production_status } = req.body;

    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Recalculate if items provided
    let subtotal = existing.subtotal;
    let taxAmount = existing.tax_amount;
    let totalAmount = existing.total_amount;
    const discountAmount = discount !== undefined ? discount : existing.discount;

    if (items && Array.isArray(items)) {
      subtotal = 0;
      for (const item of items) {
        item.total_price = (item.quantity || 1) * (item.unit_price || 0);
        subtotal += item.total_price;
      }
      taxAmount = Math.round((subtotal - discountAmount) * 0.11);
      totalAmount = subtotal - discountAmount + taxAmount;

      // Replace items
      await db.run('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
      for (const item of items) {
        await db.run(
          `INSERT INTO order_items (order_id, item_name, description, material, size, print_type, quantity, unit_price, total_price, specifications)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.params.id, item.item_name, item.description || null, item.material || null, item.size || null, item.print_type || null, item.quantity || 1, item.unit_price || 0, item.total_price, item.specifications ? JSON.stringify(item.specifications) : null]
        );
      }
    }

    const completedAt = production_status === 'delivered' ? new Date().toISOString() : existing.completed_at;

    await db.run(
      `UPDATE orders SET client_id = ?, subtotal = ?, discount = ?, tax_amount = ?, total_amount = ?,
       payment_status = ?, production_status = ?, notes = ?, due_date = ?, packaging_details = ?, completed_at = ?
       WHERE id = ?`,
      [
        client_id || existing.client_id, subtotal, discountAmount, taxAmount, totalAmount,
        payment_status || existing.payment_status, production_status || existing.production_status,
        notes !== undefined ? notes : existing.notes, due_date || existing.due_date,
        packaging_details || existing.packaging_details, completedAt, req.params.id
      ]
    );

    const updated = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    updated.items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

    res.json({ success: true, message: 'Order updated successfully', data: updated });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
});

// Update payment status
router.patch('/:id/payment-status', async (req, res) => {
  try {
    const { payment_status } = req.body;
    const valid = ['unpaid', 'dp', 'lunas'];
    if (!payment_status || !valid.includes(payment_status)) {
      return res.status(400).json({ success: false, error: `Payment status must be one of: ${valid.join(', ')}` });
    }

    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Order not found' });

    await db.run('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, req.params.id]);
    const updated = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: `Payment status updated to ${payment_status}`, data: updated });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment status' });
  }
});

// Update production status
router.patch('/:id/production-status', async (req, res) => {
  try {
    const { production_status } = req.body;
    const valid = ['pending', 'design', 'production', 'qc', 'ready', 'shipped', 'delivered'];
    if (!production_status || !valid.includes(production_status)) {
      return res.status(400).json({ success: false, error: `Production status must be one of: ${valid.join(', ')}` });
    }

    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Order not found' });

    const completedAt = production_status === 'delivered' ? new Date().toISOString() : null;
    await db.run('UPDATE orders SET production_status = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?',
      [production_status, completedAt, req.params.id]);

    const updated = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: `Production status updated to ${production_status}`, data: updated });
  } catch (error) {
    console.error('Update production status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update production status' });
  }
});

// Delete order
router.delete('/:id', auth.requireAdmin, async (req, res) => {
  try {
    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Order not found' });

    await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete order' });
  }
});

module.exports = router;
