const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

router.use(auth.verifyToken);

// Get all invoices
router.get('/', auth.requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT i.*, o.order_number, c.name as client_name, c.company_name
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN clients c ON o.client_id = c.id
    `;
    const params = [];
    if (status) { query += ' WHERE i.status = ?'; params.push(status); }
    query += ' ORDER BY i.created_at DESC';

    const invoices = await db.query(query, params);
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await db.get(`
      SELECT i.*, o.order_number, o.subtotal as order_subtotal, o.discount as order_discount,
             c.name as client_name, c.company_name, c.email as client_email,
             c.phone as client_phone, c.address as client_address, c.npwp as client_npwp
      FROM invoices i
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE i.id = ?
    `, [req.params.id]);

    if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });

    invoice.items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [invoice.order_id]);

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoice' });
  }
});

// Generate invoice for an order
router.post('/generate/:orderId', async (req, res) => {
  try {
    const order = await db.get(`
      SELECT o.*, c.name as client_name, c.company_name, c.npwp as client_npwp
      FROM orders o LEFT JOIN clients c ON o.client_id = c.id
      WHERE o.id = ?
    `, [req.params.orderId]);

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Check if invoice already exists
    const existing = await db.get('SELECT * FROM invoices WHERE order_id = ?', [req.params.orderId]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Invoice already exists for this order', data: existing });
    }

    // Generate invoice number: INV-YYYY-SEQ
    const date = new Date();
    const count = await db.get('SELECT COUNT(*) as c FROM invoices WHERE created_at >= ?', [
      `${date.getFullYear()}-01-01`
    ]);
    const seq = String((count.c || 0) + 1).padStart(4, '0');
    const invoiceNumber = `INV-${date.getFullYear()}-${seq}`;

    // Due date: 30 days from now or order due_date
    const dueDate = order.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await db.run(
      `INSERT INTO invoices (order_id, invoice_number, subtotal, tax_amount, total_amount, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order.id, invoiceNumber, order.subtotal - order.discount, order.tax_amount, order.total_amount, dueDate, 'draft']
    );

    const invoice = await db.get('SELECT * FROM invoices WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate invoice' });
  }
});

// Update invoice status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!status || !valid.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${valid.join(', ')}` });
    }

    const existing = await db.get('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Invoice not found' });

    await db.run('UPDATE invoices SET status = ? WHERE id = ?', [status, req.params.id]);

    // If paid, update order payment status
    if (status === 'paid') {
      await db.run('UPDATE orders SET payment_status = ? WHERE id = ?', ['lunas', existing.order_id]);
    }

    const updated = await db.get('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: `Invoice status updated to ${status}`, data: updated });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update invoice status' });
  }
});

// Generate tax invoice (faktur pajak)
router.post('/:orderId/tax-invoice', async (req, res) => {
  try {
    const order = await db.get(`
      SELECT o.*, c.npwp, c.company_name
      FROM orders o LEFT JOIN clients c ON o.client_id = c.id
      WHERE o.id = ?
    `, [req.params.orderId]);

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (!order.npwp) return res.status(400).json({ success: false, error: 'Client NPWP is required for tax invoice' });

    // Check existing
    const existing = await db.get('SELECT * FROM tax_invoices WHERE order_id = ?', [req.params.orderId]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Tax invoice already exists', data: existing });
    }

    // Get related invoice
    const invoice = await db.get('SELECT * FROM invoices WHERE order_id = ?', [req.params.orderId]);

    // Generate faktur number
    const date = new Date();
    const count = await db.get('SELECT COUNT(*) as c FROM tax_invoices WHERE created_at >= ?', [
      `${date.getFullYear()}-01-01`
    ]);
    const seq = String((count.c || 0) + 1).padStart(4, '0');
    const fakturNumber = `FP-${date.getFullYear()}-${seq}`;

    const result = await db.run(
      `INSERT INTO tax_invoices (order_id, invoice_id, faktur_number, npwp, company_name, tax_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order.id, invoice ? invoice.id : null, fakturNumber, order.npwp, order.company_name, order.tax_amount]
    );

    const taxInvoice = await db.get('SELECT * FROM tax_invoices WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Tax invoice generated successfully',
      data: taxInvoice
    });
  } catch (error) {
    console.error('Generate tax invoice error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate tax invoice' });
  }
});

// Delete invoice
router.delete('/:id', auth.requireAdmin, async (req, res) => {
  try {
    const existing = await db.get('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, error: 'Invoice not found' });

    await db.run('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete invoice' });
  }
});

module.exports = router;
