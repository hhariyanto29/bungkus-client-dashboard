const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { generateInvoicePDF, generateTaxInvoicePDF } = require('../utils/pdfGenerator');

// PUBLIC routes - no authentication required
// These are accessed by clients after scanning QR code

// Helper: validate hash, log access, return QR + order data
async function validateAccess(secretHash, req, action = 'view') {
  const qr = await db.get(
    'SELECT * FROM qr_codes WHERE secret_hash = ?',
    [secretHash]
  );

  if (!qr) return { error: 'Invalid QR code', status: 404 };
  if (!qr.is_active) return { error: 'QR code has been deactivated', status: 403 };

  // Check expiry
  if (qr.expires_at && new Date(qr.expires_at) < new Date()) {
    await db.run('UPDATE qr_codes SET is_active = 0 WHERE id = ?', [qr.id]);
    return { error: 'QR code has expired', status: 403 };
  }

  // Update access stats
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  await db.run(
    'UPDATE qr_codes SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP, last_ip = ? WHERE id = ?',
    [ip, qr.id]
  );

  // Log access
  await db.run(
    'INSERT INTO access_logs (qr_id, ip_address, user_agent, action) VALUES (?, ?, ?, ?)',
    [qr.id, ip, req.headers['user-agent'] || 'unknown', action]
  );

  return { qr };
}

// Main portal entry - validates hash, returns order summary
router.get('/:secretHash', async (req, res) => {
  try {
    const result = await validateAccess(req.params.secretHash, req);
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    const order = await db.get(`
      SELECT o.id, o.order_number, o.subtotal, o.discount, o.tax_amount, o.total_amount,
             o.payment_status, o.production_status, o.notes, o.due_date, o.created_at, o.completed_at,
             c.name as client_name, c.company_name, c.email as client_email
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE o.id = ?
    `, [result.qr.order_id]);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Get items
    const items = await db.query(
      'SELECT item_name as product_name, quantity, unit_price, total_price as subtotal FROM order_items WHERE order_id = ?',
      [order.id]
    );

    // Get shipment status
    const latestShipment = await db.get(
      'SELECT status, courier, tracking_number FROM shipments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
      [order.id]
    );

    // Check if invoice exists
    const hasInvoice = await db.get(
      'SELECT id, invoice_number, status FROM invoices WHERE order_id = ?', [order.id]
    );

    // Check if tax invoice exists
    const hasTaxInvoice = await db.get(
      'SELECT id, faktur_number FROM tax_invoices WHERE order_id = ?', [order.id]
    );

    res.json({
      success: true,
      data: {
        order: {
          ...order,
          items_count: items.length,
          items
        },
        shipping: latestShipment || null,
        invoice: hasInvoice || null,
        tax_invoice: hasTaxInvoice || null
      }
    });
  } catch (error) {
    console.error('Portal entry error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get full order details with items
router.get('/:secretHash/order', async (req, res) => {
  try {
    const result = await validateAccess(req.params.secretHash, req, 'view_order');
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    const order = await db.get(`
      SELECT o.*, c.name as client_name, c.company_name
      FROM orders o LEFT JOIN clients c ON o.client_id = c.id
      WHERE o.id = ?
    `, [result.qr.order_id]);

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.items = await db.query(
      'SELECT item_name, description, material, size, print_type, quantity, unit_price, total_price FROM order_items WHERE order_id = ?',
      [order.id]
    );

    // Remove sensitive fields
    delete order.client_id;

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Portal order error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get tracking info
router.get('/:secretHash/tracking', async (req, res) => {
  try {
    const result = await validateAccess(req.params.secretHash, req, 'view_tracking');
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    const shipments = await db.query(`
      SELECT tracking_number, courier, service_type, status, estimated_delivery,
             actual_delivery, shipping_address, notes, created_at, updated_at
      FROM shipments WHERE order_id = ? ORDER BY created_at DESC
    `, [result.qr.order_id]);

    // Get order production status for timeline
    const order = await db.get(
      'SELECT order_number, production_status, created_at, completed_at FROM orders WHERE id = ?',
      [result.qr.order_id]
    );

    // Build production timeline
    const statusTimeline = ['pending', 'design', 'production', 'qc', 'ready', 'shipped', 'delivered'];
    const currentIndex = statusTimeline.indexOf(order.production_status);
    const timeline = statusTimeline.map((status, index) => ({
      status,
      label: {
        pending: 'Order Diterima',
        design: 'Proses Desain',
        production: 'Produksi',
        qc: 'Quality Control',
        ready: 'Siap Kirim',
        shipped: 'Dalam Pengiriman',
        delivered: 'Terkirim'
      }[status],
      completed: index <= currentIndex,
      current: index === currentIndex
    }));

    res.json({
      success: true,
      data: {
        order_number: order.order_number,
        production_status: order.production_status,
        timeline,
        shipments
      }
    });
  } catch (error) {
    console.error('Portal tracking error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get invoice details
router.get('/:secretHash/invoice', async (req, res) => {
  try {
    const result = await validateAccess(req.params.secretHash, req, 'view_invoice');
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    const invoice = await db.get(`
      SELECT i.*, o.order_number, c.name as client_name, c.company_name,
             c.address as client_address, c.npwp as client_npwp
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE i.order_id = ?
    `, [result.qr.order_id]);

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not available yet' });
    }

    invoice.items = await db.query(
      'SELECT item_name, description, quantity, unit_price, total_price FROM order_items WHERE order_id = ?',
      [result.qr.order_id]
    );

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Portal invoice error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get tax invoice details
router.get('/:secretHash/tax-invoice', async (req, res) => {
  try {
    const result = await validateAccess(req.params.secretHash, req, 'view_tax_invoice');
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    const taxInvoice = await db.get(`
      SELECT ti.*, o.order_number, o.subtotal, o.total_amount
      FROM tax_invoices ti
      LEFT JOIN orders o ON ti.order_id = o.id
      WHERE ti.order_id = ?
    `, [result.qr.order_id]);

    if (!taxInvoice) {
      return res.status(404).json({ success: false, error: 'Tax invoice not available yet' });
    }

    taxInvoice.items = await db.query(
      'SELECT item_name, quantity, unit_price, total_price FROM order_items WHERE order_id = ?',
      [result.qr.order_id]
    );

    res.json({ success: true, data: taxInvoice });
  } catch (error) {
    console.error('Portal tax invoice error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Download invoice as PDF
router.get('/:secretHash/invoice/pdf', async (req, res) => {
  try {
    const result = await validateAccess(req.params.secretHash, req, 'download_invoice');
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    const invoice = await db.get(`
      SELECT i.*, o.order_number, o.due_date, c.name as client_name, c.company_name,
             c.address as client_address, c.npwp as client_npwp
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE i.order_id = ?
    `, [result.qr.order_id]);

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not available' });
    }

    const items = await db.query(
      'SELECT item_name, description, quantity, unit_price, total_price FROM order_items WHERE order_id = ?',
      [result.qr.order_id]
    );

    const pdfBuffer = await generateInvoicePDF(invoice, items);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Portal invoice PDF error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
});

// Download tax invoice as PDF
router.get('/:secretHash/tax-invoice/pdf', async (req, res) => {
  try {
    const result = await validateAccess(req.params.secretHash, req, 'download_tax_invoice');
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    const taxInvoice = await db.get(`
      SELECT ti.*, o.order_number, o.subtotal, o.total_amount
      FROM tax_invoices ti
      LEFT JOIN orders o ON ti.order_id = o.id
      WHERE ti.order_id = ?
    `, [result.qr.order_id]);

    if (!taxInvoice) {
      return res.status(404).json({ success: false, error: 'Tax invoice not available' });
    }

    const items = await db.query(
      'SELECT item_name, quantity, unit_price, total_price FROM order_items WHERE order_id = ?',
      [result.qr.order_id]
    );

    const pdfBuffer = await generateTaxInvoicePDF(taxInvoice, items);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${taxInvoice.faktur_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Portal tax invoice PDF error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
});

// Get order history for the same client
router.get('/:secretHash/history', async (req, res) => {
  try {
    const result = await validateAccess(req.params.secretHash, req, 'view_history');
    if (result.error) {
      return res.status(result.status).json({ success: false, error: result.error });
    }

    // Get client_id from this order
    const order = await db.get('SELECT client_id FROM orders WHERE id = ?', [result.qr.order_id]);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Get other orders from same client that have active QR codes
    const history = await db.query(`
      SELECT o.id, o.order_number, o.total_amount, o.payment_status, o.production_status,
             o.created_at, o.completed_at,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      WHERE o.client_id = ?
      ORDER BY o.created_at DESC
      LIMIT 20
    `, [order.client_id]);

    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('Portal history error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
