const PDFDocument = require('pdfkit');

// Color constants
const COLORS = {
  dark: '#0a0a1a',
  cyan: '#00c8d6',
  white: '#e2e8f0',
  muted: '#94a3b8',
  border: '#1e293b',
  accent: '#0891b2',
};

function setupDoc(doc) {
  // Register fonts if available, otherwise use Helvetica
  doc.font('Helvetica');
}

function drawHeader(doc, title) {
  // Header bar
  doc.rect(0, 0, doc.page.width, 80).fill(COLORS.dark);
  doc.fontSize(22).fill(COLORS.cyan).text('BUNGKUS', 50, 25, { continued: true });
  doc.fontSize(10).fill(COLORS.muted).text('  INDONESIA', { baseline: 'alphabetic' });
  doc.fontSize(10).fill(COLORS.muted).text(title, 50, 52);

  // Date on right
  const now = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.fontSize(8).fill(COLORS.muted).text(now, doc.page.width - 200, 55, { width: 150, align: 'right' });

  doc.moveDown(2);
  doc.y = 100;
}

function drawLine(doc, y) {
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
}

function drawInfoRow(doc, label, value, y, options = {}) {
  doc.fontSize(9).fill(COLORS.muted).text(label, 50, y, { width: 150 });
  doc.fontSize(options.bold ? 11 : 10)
    .fill(options.color || COLORS.white)
    .text(value || '-', 200, y, { width: doc.page.width - 250, align: options.align || 'left' });
}

function formatRp(amount) {
  return `Rp ${(amount || 0).toLocaleString('id-ID')}`;
}

/**
 * Generate Invoice PDF
 */
function generateInvoicePDF(invoice, items) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      setupDoc(doc);
      drawHeader(doc, 'INVOICE');

      let y = 110;

      // Invoice info box
      doc.rect(50, y, doc.page.width - 100, 100).fill('#111127').stroke(COLORS.border);
      y += 15;
      drawInfoRow(doc, 'No. Invoice', invoice.invoice_number, y);
      y += 20;
      drawInfoRow(doc, 'No. Order', invoice.order_number, y);
      y += 20;
      drawInfoRow(doc, 'Tanggal', invoice.invoice_date
        ? new Date(invoice.invoice_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
        : new Date(invoice.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), y);
      y += 20;
      if (invoice.due_date) {
        drawInfoRow(doc, 'Jatuh Tempo', new Date(invoice.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), y);
      }

      y += 35;

      // Client info
      doc.fontSize(9).fill(COLORS.cyan).text('KEPADA', 50, y);
      y += 15;
      doc.fontSize(11).fill(COLORS.white).text(invoice.company_name || invoice.client_name || '-', 50, y);
      y += 15;
      if (invoice.client_address) {
        doc.fontSize(9).fill(COLORS.muted).text(invoice.client_address, 50, y);
        y += 12;
      }
      if (invoice.client_npwp) {
        doc.fontSize(9).fill(COLORS.muted).text(`NPWP: ${invoice.client_npwp}`, 50, y);
        y += 12;
      }

      y += 15;

      // Items table header
      const colX = [50, 280, 340, 410, 480];
      doc.rect(50, y, doc.page.width - 100, 22).fill('#111127');
      doc.fontSize(8).fill(COLORS.cyan);
      doc.text('ITEM', colX[0] + 8, y + 7);
      doc.text('QTY', colX[1] + 5, y + 7, { width: 50, align: 'right' });
      doc.text('HARGA', colX[2] + 5, y + 7, { width: 60, align: 'right' });
      doc.text('SUBTOTAL', colX[3] + 5, y + 7, { width: 80, align: 'right' });
      y += 22;

      // Items rows
      if (items && items.length > 0) {
        items.forEach((item, idx) => {
          const rowBg = idx % 2 === 0 ? '#0d0d20' : '#111127';
          doc.rect(50, y, doc.page.width - 100, 22).fill(rowBg);
          doc.fontSize(9).fill(COLORS.white);
          doc.text(item.item_name || item.product_name || '-', colX[0] + 8, y + 7, { width: 220 });
          doc.fill(COLORS.muted);
          doc.text(String(item.quantity || 0), colX[1] + 5, y + 7, { width: 50, align: 'right' });
          doc.text(formatRp(item.unit_price), colX[2] + 5, y + 7, { width: 60, align: 'right' });
          doc.fill(COLORS.white);
          doc.text(formatRp(item.total_price || item.subtotal), colX[3] + 5, y + 7, { width: 80, align: 'right' });
          y += 22;
        });
      }

      y += 10;
      drawLine(doc, y);
      y += 15;

      // Totals
      const totalsX = doc.page.width - 200;
      doc.fontSize(9).fill(COLORS.muted).text('Subtotal', totalsX - 100, y, { width: 90, align: 'right' });
      doc.fontSize(10).fill(COLORS.white).text(formatRp(invoice.subtotal), totalsX, y, { width: 100, align: 'right' });
      y += 18;

      if (invoice.discount > 0) {
        doc.fontSize(9).fill(COLORS.muted).text('Diskon', totalsX - 100, y, { width: 90, align: 'right' });
        doc.fontSize(10).fill('#f43f5e').text(`- ${formatRp(invoice.discount)}`, totalsX, y, { width: 100, align: 'right' });
        y += 18;
      }

      doc.fontSize(9).fill(COLORS.muted).text('PPN 11%', totalsX - 100, y, { width: 90, align: 'right' });
      doc.fontSize(10).fill(COLORS.white).text(formatRp(invoice.tax_amount), totalsX, y, { width: 100, align: 'right' });
      y += 22;

      drawLine(doc, y);
      y += 10;

      doc.fontSize(10).fill(COLORS.white).text('TOTAL', totalsX - 100, y, { width: 90, align: 'right' });
      doc.fontSize(14).fill(COLORS.cyan).text(formatRp(invoice.total_amount), totalsX, y - 2, { width: 100, align: 'right' });

      // Footer
      const footerY = doc.page.height - 80;
      drawLine(doc, footerY);
      doc.fontSize(8).fill(COLORS.muted)
        .text('PT Bungkus Indonesia', 50, footerY + 10)
        .text('Dokumen ini digenerate secara digital dan sah tanpa tanda tangan.', 50, footerY + 22)
        .text(`Generated: ${new Date().toISOString()}`, 50, footerY + 34);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate Faktur Pajak PDF
 */
function generateTaxInvoicePDF(taxInvoice, items) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      setupDoc(doc);
      drawHeader(doc, 'FAKTUR PAJAK');

      let y = 110;

      // Faktur info box
      doc.rect(50, y, doc.page.width - 100, 80).fill('#111127').stroke(COLORS.border);
      y += 15;
      drawInfoRow(doc, 'No. Faktur Pajak', taxInvoice.faktur_number, y, { bold: true, color: COLORS.cyan });
      y += 20;
      drawInfoRow(doc, 'No. Order', taxInvoice.order_number, y);
      y += 20;
      drawInfoRow(doc, 'Tanggal', new Date(taxInvoice.created_at).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
      }), y);

      y += 40;

      // PKP (Pengusaha Kena Pajak) info
      doc.fontSize(9).fill(COLORS.cyan).text('PENGUSAHA KENA PAJAK', 50, y);
      y += 15;
      doc.fontSize(10).fill(COLORS.white).text('PT Bungkus Indonesia', 50, y);
      y += 14;
      doc.fontSize(9).fill(COLORS.muted).text('NPWP: 00.000.000.0-000.000', 50, y);

      y += 25;

      // Pembeli
      doc.fontSize(9).fill(COLORS.cyan).text('PEMBELI', 50, y);
      y += 15;
      doc.fontSize(10).fill(COLORS.white).text(taxInvoice.company_name || '-', 50, y);
      y += 14;
      doc.fontSize(9).fill(COLORS.muted).text(`NPWP: ${taxInvoice.npwp || '-'}`, 50, y);

      y += 25;

      // Items table
      const colX = [50, 280, 340, 410, 480];
      doc.rect(50, y, doc.page.width - 100, 22).fill('#111127');
      doc.fontSize(8).fill(COLORS.cyan);
      doc.text('BARANG/JASA', colX[0] + 8, y + 7);
      doc.text('QTY', colX[1] + 5, y + 7, { width: 50, align: 'right' });
      doc.text('HARGA', colX[2] + 5, y + 7, { width: 60, align: 'right' });
      doc.text('JUMLAH', colX[3] + 5, y + 7, { width: 80, align: 'right' });
      y += 22;

      if (items && items.length > 0) {
        items.forEach((item, idx) => {
          const rowBg = idx % 2 === 0 ? '#0d0d20' : '#111127';
          doc.rect(50, y, doc.page.width - 100, 22).fill(rowBg);
          doc.fontSize(9).fill(COLORS.white);
          doc.text(item.item_name || '-', colX[0] + 8, y + 7, { width: 220 });
          doc.fill(COLORS.muted);
          doc.text(String(item.quantity || 0), colX[1] + 5, y + 7, { width: 50, align: 'right' });
          doc.text(formatRp(item.unit_price), colX[2] + 5, y + 7, { width: 60, align: 'right' });
          doc.fill(COLORS.white);
          doc.text(formatRp(item.total_price), colX[3] + 5, y + 7, { width: 80, align: 'right' });
          y += 22;
        });
      }

      y += 15;
      drawLine(doc, y);
      y += 15;

      // Tax breakdown
      const totalsX = doc.page.width - 200;

      doc.fontSize(9).fill(COLORS.muted).text('DPP (Dasar Pengenaan Pajak)', totalsX - 150, y, { width: 140, align: 'right' });
      doc.fontSize(10).fill(COLORS.white).text(formatRp(taxInvoice.subtotal), totalsX, y, { width: 100, align: 'right' });
      y += 20;

      doc.fontSize(9).fill(COLORS.muted).text('PPN 11%', totalsX - 150, y, { width: 140, align: 'right' });
      doc.fontSize(10).fill(COLORS.white).text(formatRp(taxInvoice.tax_amount), totalsX, y, { width: 100, align: 'right' });
      y += 22;

      drawLine(doc, y);
      y += 10;

      doc.fontSize(10).fill(COLORS.white).text('TOTAL', totalsX - 150, y, { width: 140, align: 'right' });
      doc.fontSize(14).fill(COLORS.cyan).text(formatRp(taxInvoice.total_amount), totalsX, y - 2, { width: 100, align: 'right' });

      // Footer
      const footerY = doc.page.height - 100;
      drawLine(doc, footerY);
      doc.fontSize(8).fill(COLORS.muted)
        .text('PT Bungkus Indonesia', 50, footerY + 10)
        .text('Faktur Pajak ini diterbitkan sesuai dengan ketentuan perpajakan yang berlaku.', 50, footerY + 22)
        .text('Dokumen ini sah sebagai bukti pungutan Pajak Pertambahan Nilai (PPN).', 50, footerY + 34)
        .text(`Generated: ${new Date().toISOString()}`, 50, footerY + 50);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateInvoicePDF, generateTaxInvoicePDF };
