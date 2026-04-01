const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const db = require('../config/database');

const PORTAL_BASE_URL = process.env.PORTAL_BASE_URL || 'http://localhost:3002';

router.use(auth.verifyToken);

// Get QR code statistics (must be before /:id)
router.get('/stats/overview', auth.requireAdmin, async (req, res) => {
  try {
    const totalQRCodes = await db.get('SELECT COUNT(*) as count FROM qr_codes');
    const activeQRCodes = await db.get('SELECT COUNT(*) as count FROM qr_codes WHERE is_active = 1');
    const totalAccess = await db.get('SELECT SUM(access_count) as total FROM qr_codes');

    const today = new Date().toISOString().split('T')[0];
    const todaysQRCodes = await db.get(
      'SELECT COUNT(*) as count FROM qr_codes WHERE DATE(created_at) = ?', [today]
    );

    const recentDeliveries = await db.query(`
      SELECT dl.*, qr.secret_hash, o.order_number
      FROM qr_delivery_log dl
      LEFT JOIN qr_codes qr ON dl.qr_id = qr.id
      LEFT JOIN orders o ON qr.order_id = o.id
      ORDER BY dl.delivered_at DESC LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalQRCodes: totalQRCodes.count,
        activeQRCodes: activeQRCodes.count,
        totalAccess: totalAccess.total || 0,
        todaysQRCodes: todaysQRCodes.count,
        recentDeliveries
      }
    });
  } catch (error) {
    console.error('Get QR stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch QR statistics' });
  }
});

// Get all QR codes
router.get('/', auth.requireAdmin, async (req, res) => {
  try {
    const { order_id, is_active } = req.query;
    let query = `
      SELECT qr.*, o.order_number, c.name as client_name, c.company_name
      FROM qr_codes qr
      LEFT JOIN orders o ON qr.order_id = o.id
      LEFT JOIN clients c ON o.client_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (order_id) { conditions.push('qr.order_id = ?'); params.push(order_id); }
    if (is_active !== undefined) { conditions.push('qr.is_active = ?'); params.push(is_active); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY qr.created_at DESC';

    const qrCodes = await db.query(query, params);

    const result = qrCodes.map((qr) => {
      const portalUrl = `${PORTAL_BASE_URL}/${qr.secret_hash}`;
      return { ...qr, portal_url: portalUrl };
    });

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch QR codes' });
  }
});

// Get QR codes for an order
router.get('/order/:orderId', async (req, res) => {
  try {
    const qrCodes = await db.query(
      'SELECT * FROM qr_codes WHERE order_id = ? ORDER BY created_at DESC',
      [req.params.orderId]
    );

    const result = qrCodes.map((qr) => {
      const portalUrl = `${PORTAL_BASE_URL}/${qr.secret_hash}`;
      return { ...qr, portal_url: portalUrl };
    });

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    console.error('Get order QR codes error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch QR codes' });
  }
});

// Generate QR code for an order
router.post('/generate/:orderId', async (req, res) => {
  try {
    const { expires_in_days } = req.body;

    const order = await db.get(`
      SELECT o.*, c.name as client_name FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE o.id = ?
    `, [req.params.orderId]);

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Generate secret hash (64 hex chars = 256 bits)
    const secretHash = crypto.randomBytes(32).toString('hex');

    // Expiry date (default 365 days)
    const days = expires_in_days || 365;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const result = await db.run(
      `INSERT INTO qr_codes (order_id, secret_hash, is_active, expires_at)
       VALUES (?, ?, 1, ?)`,
      [order.id, secretHash, expiresAt]
    );

    const portalUrl = `${PORTAL_BASE_URL}/${secretHash}`;

    const qr = await db.get('SELECT * FROM qr_codes WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        ...qr,
        portal_url: portalUrl,
        order_number: order.order_number,
        client_name: order.client_name
      }
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
});

// Record QR delivery method
router.post('/:id/deliver', async (req, res) => {
  try {
    const { delivery_method, recipient } = req.body;
    const validMethods = ['email', 'print', 'whatsapp', 'pdf_embed'];
    if (!delivery_method || !validMethods.includes(delivery_method)) {
      return res.status(400).json({ success: false, error: `Delivery method must be one of: ${validMethods.join(', ')}` });
    }

    const qr = await db.get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    if (!qr) return res.status(404).json({ success: false, error: 'QR code not found' });

    await db.run(
      `INSERT INTO qr_delivery_log (qr_id, delivery_method, recipient, delivered_by)
       VALUES (?, ?, ?, ?)`,
      [qr.id, delivery_method, recipient || null, req.user.id]
    );

    // Generate WhatsApp link if method is whatsapp
    let whatsapp_link = null;
    if (delivery_method === 'whatsapp' && recipient) {
      const portalUrl = `${PORTAL_BASE_URL}/${qr.secret_hash}`;
      const message = encodeURIComponent(
        `Halo, berikut link untuk tracking order Anda di PT Bungkus Indonesia:\n${portalUrl}\n\nScan QR code atau klik link di atas untuk melihat status order.`
      );
      const phone = recipient.replace(/[^0-9]/g, '');
      whatsapp_link = `https://wa.me/${phone}?text=${message}`;
    }

    res.json({
      success: true,
      message: `QR code delivered via ${delivery_method}`,
      data: { delivery_method, recipient, whatsapp_link }
    });
  } catch (error) {
    console.error('Deliver QR error:', error);
    res.status(500).json({ success: false, error: 'Failed to record QR delivery' });
  }
});

// Deactivate QR code
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const existing = await db.get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'QR code not found' });

    await db.run('UPDATE qr_codes SET is_active = 0 WHERE id = ?', [req.params.id]);
    const updated = await db.get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'QR code deactivated', data: updated });
  } catch (error) {
    console.error('Deactivate QR error:', error);
    res.status(500).json({ success: false, error: 'Failed to deactivate QR code' });
  }
});

// Regenerate QR code (new hash, deactivate old)
router.post('/:id/regenerate', async (req, res) => {
  try {
    const existing = await db.get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'QR code not found' });

    // Deactivate old
    await db.run('UPDATE qr_codes SET is_active = 0 WHERE id = ?', [req.params.id]);

    // Generate new
    const secretHash = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const result = await db.run(
      'INSERT INTO qr_codes (order_id, secret_hash, is_active, expires_at) VALUES (?, ?, 1, ?)',
      [existing.order_id, secretHash, expiresAt]
    );

    const portalUrl = `${PORTAL_BASE_URL}/${secretHash}`;
    const qr = await db.get('SELECT * FROM qr_codes WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'QR code regenerated (old code deactivated)',
      data: { ...qr, portal_url: portalUrl }
    });
  } catch (error) {
    console.error('Regenerate QR error:', error);
    res.status(500).json({ success: false, error: 'Failed to regenerate QR code' });
  }
});

// Delete QR code
router.delete('/:id', auth.requireAdmin, async (req, res) => {
  try {
    const existing = await db.get('SELECT * FROM qr_codes WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'QR code not found' });

    await db.run('DELETE FROM qr_codes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Delete QR error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete QR code' });
  }
});

module.exports = router;
