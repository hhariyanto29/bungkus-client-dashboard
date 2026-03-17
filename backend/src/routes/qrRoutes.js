const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');
const QRCode = require('qrcode');

// Apply authentication middleware to all routes
router.use(auth.verifyToken);

// Generate QR code
router.post('/generate', async (req, res) => {
  try {
    const { client_id, table_number, valid_until } = req.body;

    if (!client_id || !table_number) {
      return res.status(400).json({
        success: false,
        error: 'Client ID and table number are required'
      });
    }

    // Check if client exists
    const client = await db.get(
      'SELECT * FROM clients WHERE id = ?',
      [client_id]
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Generate QR data
    const qrData = JSON.stringify({
      client_id,
      client_name: client.name,
      table_number,
      generated_at: new Date().toISOString(),
      valid_until: valid_until || null
    });

    // Generate QR code image
    const qrImage = await QRCode.toDataURL(qrData);

    // Save to database
    const result = await db.run(
      `INSERT INTO qr_codes (client_id, table_number, qr_data, valid_until) 
       VALUES (?, ?, ?, ?)`,
      [client_id, table_number, qrData, valid_until || null]
    );

    const newQR = await db.get(
      'SELECT * FROM qr_codes WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        ...newQR,
        qr_image: qrImage
      }
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    });
  }
});

// Get all QR codes
router.get('/', auth.requireAdmin, async (req, res) => {
  try {
    const { client_id, status } = req.query;
    
    let query = `
      SELECT qr.*, c.name as client_name, c.email as client_email 
      FROM qr_codes qr
      LEFT JOIN clients c ON qr.client_id = c.id
    `;
    
    const params = [];
    const conditions = [];

    if (client_id) {
      conditions.push('qr.client_id = ?');
      params.push(client_id);
    }

    if (status) {
      conditions.push('qr.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY qr.created_at DESC';

    const qrCodes = await db.query(query, params);

    // Generate QR images for each code
    const qrCodesWithImages = await Promise.all(
      qrCodes.map(async (qr) => {
        const qrImage = await QRCode.toDataURL(qr.qr_data);
        return {
          ...qr,
          qr_image: qrImage
        };
      })
    );

    res.json({
      success: true,
      count: qrCodesWithImages.length,
      data: qrCodesWithImages
    });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch QR codes'
    });
  }
});

// Get single QR code by ID
router.get('/:id', async (req, res) => {
  try {
    const qr = await db.get(
      `SELECT qr.*, c.name as client_name, c.email as client_email 
       FROM qr_codes qr
       LEFT JOIN clients c ON qr.client_id = c.id
       WHERE qr.id = ?`,
      [req.params.id]
    );

    if (!qr) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found'
      });
    }

    // Generate QR image
    const qrImage = await QRCode.toDataURL(qr.qr_data);

    res.json({
      success: true,
      data: {
        ...qr,
        qr_image: qrImage
      }
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch QR code'
    });
  }
});

// Update QR code status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const validStatuses = ['active', 'inactive', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: active, inactive, expired'
      });
    }

    // Check if QR code exists
    const existingQR = await db.get(
      'SELECT * FROM qr_codes WHERE id = ?',
      [req.params.id]
    );

    if (!existingQR) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found'
      });
    }

    // Update status
    await db.run(
      'UPDATE qr_codes SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    const updatedQR = await db.get(
      'SELECT * FROM qr_codes WHERE id = ?',
      [req.params.id]
    );

    // Generate QR image
    const qrImage = await QRCode.toDataURL(updatedQR.qr_data);

    res.json({
      success: true,
      message: `QR code status updated to ${status}`,
      data: {
        ...updatedQR,
        qr_image: qrImage
      }
    });
  } catch (error) {
    console.error('Update QR status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update QR code status'
    });
  }
});

// Delete QR code
router.delete('/:id', auth.requireAdmin, async (req, res) => {
  try {
    // Check if QR code exists
    const existingQR = await db.get(
      'SELECT * FROM qr_codes WHERE id = ?',
      [req.params.id]
    );

    if (!existingQR) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found'
      });
    }

    // Delete QR code
    await db.run('DELETE FROM qr_codes WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    console.error('Delete QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete QR code'
    });
  }
});

// Validate QR code (public endpoint)
router.post('/validate', async (req, res) => {
  try {
    const { qr_data } = req.body;

    if (!qr_data) {
      return res.status(400).json({
        success: false,
        error: 'QR data is required'
      });
    }

    // Find QR code by data
    const qr = await db.get(
      `SELECT qr.*, c.name as client_name, c.email as client_email 
       FROM qr_codes qr
       LEFT JOIN clients c ON qr.client_id = c.id
       WHERE qr.qr_data = ?`,
      [qr_data]
    );

    if (!qr) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found'
      });
    }

    // Check if QR code is active
    if (qr.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'QR code is not active'
      });
    }

    // Check if QR code has expired
    if (qr.valid_until && new Date(qr.valid_until) < new Date()) {
      // Update status to expired
      await db.run(
        'UPDATE qr_codes SET status = "expired" WHERE id = ?',
        [qr.id]
      );

      return res.status(400).json({
        success: false,
        error: 'QR code has expired'
      });
    }

    res.json({
      success: true,
      message: 'QR code is valid',
      data: {
        client_name: qr.client_name,
        table_number: qr.table_number,
        valid_until: qr.valid_until
      }
    });
  } catch (error) {
    console.error('Validate QR error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate QR code'
    });
  }
});

// Get QR code statistics
router.get('/stats/overview', auth.requireAdmin, async (req, res) => {
  try {
    // Get total QR codes
    const totalQRCodes = await db.get('SELECT COUNT(*) as count FROM qr_codes');

    // Get QR codes by status
    const qrCodesByStatus = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM qr_codes 
      GROUP BY status
    `);

    // Get QR codes by client
    const qrCodesByClient = await db.query(`
      SELECT c.name as client_name, COUNT(qr.id) as count
      FROM qr_codes qr
      LEFT JOIN clients c ON qr.client_id = c.id
      GROUP BY qr.client_id
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get today's generated QR codes
    const today = new Date().toISOString().split('T')[0];
    const todaysQRCodes = await db.get(`
      SELECT COUNT(*) as count 
      FROM qr_codes 
      WHERE DATE(created_at) = ?
    `, [today]);

    res.json({
      success: true,
      data: {
        totalQRCodes: totalQRCodes.count,
        qrCodesByStatus,
        qrCodesByClient,
        todaysQRCodes: todaysQRCodes.count
      }
    });
  } catch (error) {
    console.error('Get QR stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch QR code statistics'
    });
  }
});

// Bulk generate QR codes
router.post('/bulk-generate', auth.requireAdmin, async (req, res) => {
  try {
    const { client_id, table_numbers, valid_until } = req.body;

    if (!client_id || !table_numbers || !Array.isArray(table_numbers)) {
      return res.status(400).json({
        success: false,
        error: 'Client ID and array of table numbers are required'
      });
    }

    // Check if client exists
    const client = await db.get(
      'SELECT * FROM clients WHERE id = ?',
      [client_id]
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const generatedQRCodes = [];

    // Generate QR codes for each table number
    for (const table_number of table_numbers) {
      // Generate QR data
      const qrData = JSON.stringify({
        client_id,
        client_name: client.name,
        table_number,
        generated_at: new Date().toISOString(),
        valid_until: valid_until || null
      });

      // Generate QR code image
      const qrImage = await QRCode.toDataURL(qrData);

      // Save to database
      const result = await db.run(
        `INSERT INTO qr_codes (client_id, table_number, qr_data, valid_until) 
         VALUES (?, ?, ?, ?)`,
        [client_id, table_number, qrData, valid_until || null]
      );

      const newQR = await db.get(
        'SELECT * FROM qr_codes WHERE id = ?',
        [result.id]
      );

      generatedQRCodes.push({
        ...newQR,
        qr_image: qrImage
      });
    }

    res.status(201).json({
      success: true,
      message: `${generatedQRCodes.length} QR codes generated successfully`,
      data: generatedQRCodes
    });
  } catch (error) {
    console.error('Bulk generate QR error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR codes'
    });
  }
});

module.exports = router;