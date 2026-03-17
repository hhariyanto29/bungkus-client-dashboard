const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Apply authentication middleware to all routes
router.use(auth.verifyToken);

// Get all orders (admin only)
router.get('/', auth.requireAdmin, async (req, res) => {
  try {
    const { status, client_id, start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM orders';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (client_id) {
      conditions.push('client_id = ?');
      params.push(client_id);
    }

    if (start_date) {
      conditions.push('created_at >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('created_at <= ?');
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const orders = await db.query(query, params);

    // Parse items JSON for each order
    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json({
      success: true,
      count: parsedOrders.length,
      data: parsedOrders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await db.get(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Parse items JSON
    order.items = JSON.parse(order.items);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { client_id, client_name, table_number, items, total_amount, notes } = req.body;

    if (!client_name || !items || !total_amount) {
      return res.status(400).json({
        success: false,
        error: 'Client name, items, and total amount are required'
      });
    }

    // Generate order number
    const date = new Date();
    const orderNumber = `ORD-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const result = await db.run(
      `INSERT INTO orders (order_number, client_id, client_name, table_number, items, total_amount, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        client_id || null,
        client_name,
        table_number || null,
        JSON.stringify(items),
        total_amount,
        notes || null
      ]
    );

    const newOrder = await db.get(
      'SELECT * FROM orders WHERE id = ?',
      [result.id]
    );

    // Parse items JSON
    newOrder.items = JSON.parse(newOrder.items);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    const { client_name, table_number, items, total_amount, status, notes } = req.body;

    // Check if order exists
    const existingOrder = await db.get(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update order
    await db.run(
      `UPDATE orders 
       SET client_name = ?, table_number = ?, items = ?, total_amount = ?, status = ?, notes = ?
       WHERE id = ?`,
      [
        client_name || existingOrder.client_name,
        table_number || existingOrder.table_number,
        items ? JSON.stringify(items) : existingOrder.items,
        total_amount || existingOrder.total_amount,
        status || existingOrder.status,
        notes || existingOrder.notes,
        req.params.id
      ]
    );

    const updatedOrder = await db.get(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    // Parse items JSON
    updatedOrder.items = JSON.parse(updatedOrder.items);

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order'
    });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, processing, completed, cancelled'
      });
    }

    // Check if order exists
    const existingOrder = await db.get(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update status
    await db.run(
      `UPDATE orders 
       SET status = ?, notes = ?, completed_at = ?
       WHERE id = ?`,
      [
        status,
        notes || existingOrder.notes,
        status === 'completed' ? new Date().toISOString() : null,
        req.params.id
      ]
    );

    const updatedOrder = await db.get(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    // Parse items JSON
    updatedOrder.items = JSON.parse(updatedOrder.items);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// Delete order
router.delete('/:id', auth.requireAdmin, async (req, res) => {
  try {
    // Check if order exists
    const existingOrder = await db.get(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Delete order
    await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete order'
    });
  }
});

// Get order statistics
router.get('/stats/overview', auth.requireAdmin, async (req, res) => {
  try {
    // Get total orders
    const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders');

    // Get orders by status
    const ordersByStatus = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);

    // Get total revenue
    const totalRevenue = await db.get(`
      SELECT SUM(total_amount) as total 
      FROM orders 
      WHERE status = 'completed'
    `);

    // Get today's orders
    const today = new Date().toISOString().split('T')[0];
    const todaysOrders = await db.get(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE DATE(created_at) = ?
    `, [today]);

    // Get average order value
    const avgOrderValue = await db.get(`
      SELECT AVG(total_amount) as average 
      FROM orders 
      WHERE status = 'completed'
    `);

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders.count,
        ordersByStatus,
        totalRevenue: totalRevenue.total || 0,
        todaysOrders: todaysOrders.count,
        avgOrderValue: avgOrderValue.average || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics'
    });
  }
});

// Get recent orders
router.get('/recent/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    
    const orders = await db.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT ?',
      [limit]
    );

    // Parse items JSON for each order
    const parsedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json({
      success: true,
      count: parsedOrders.length,
      data: parsedOrders
    });
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent orders'
    });
  }
});

module.exports = router;