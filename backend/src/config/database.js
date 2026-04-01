const path = require('path');
const bcrypt = require('bcryptjs');

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

// ─── PostgreSQL adapter ────────────────────────────────────────────────────────
class PostgresAdapter {
  constructor() {
    const { Pool } = require('pg');
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.pool.on('connect', () => console.log('Connected to PostgreSQL'));
    this.pool.on('error', (err) => console.error('PostgreSQL pool error:', err.message));
    this._initialize();
  }

  async _initialize() {
    try {
      await this._initializeTables();
      await this._seedData();
    } catch (err) {
      console.error('PostgreSQL init error:', err.message);
    }
  }

  async _initializeTables() {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          company_name TEXT,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          address TEXT,
          npwp TEXT,
          location TEXT,
          status TEXT DEFAULT 'active',
          join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          revenue INTEGER DEFAULT 0
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          order_number TEXT UNIQUE NOT NULL,
          client_id INTEGER NOT NULL REFERENCES clients(id),
          subtotal INTEGER DEFAULT 0,
          discount INTEGER DEFAULT 0,
          tax_amount INTEGER DEFAULT 0,
          total_amount INTEGER DEFAULT 0,
          payment_status TEXT DEFAULT 'unpaid',
          production_status TEXT DEFAULT 'pending',
          packaging_details TEXT,
          notes TEXT,
          due_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          item_name TEXT NOT NULL,
          description TEXT,
          material TEXT,
          size TEXT,
          print_type TEXT,
          quantity INTEGER DEFAULT 1,
          unit_price INTEGER DEFAULT 0,
          total_price INTEGER DEFAULT 0,
          specifications TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          invoice_number TEXT UNIQUE NOT NULL,
          subtotal INTEGER DEFAULT 0,
          tax_amount INTEGER DEFAULT 0,
          total_amount INTEGER DEFAULT 0,
          due_date TIMESTAMP,
          status TEXT DEFAULT 'draft',
          file_path TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS tax_invoices (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          invoice_id INTEGER REFERENCES invoices(id),
          faktur_number TEXT UNIQUE NOT NULL,
          npwp TEXT NOT NULL,
          company_name TEXT NOT NULL,
          tax_amount INTEGER DEFAULT 0,
          file_path TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS shipments (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          tracking_number TEXT,
          courier TEXT,
          service_type TEXT,
          status TEXT DEFAULT 'pending',
          estimated_delivery TIMESTAMP,
          actual_delivery TIMESTAMP,
          shipping_address TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          secret_hash TEXT UNIQUE NOT NULL,
          is_active INTEGER DEFAULT 1,
          expires_at TIMESTAMP,
          access_count INTEGER DEFAULT 0,
          last_accessed TIMESTAMP,
          last_ip TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS qr_delivery_log (
          id SERIAL PRIMARY KEY,
          qr_id INTEGER NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
          delivery_method TEXT NOT NULL,
          recipient TEXT,
          delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          delivered_by INTEGER REFERENCES users(id)
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS access_logs (
          id SERIAL PRIMARY KEY,
          qr_id INTEGER NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
          ip_address TEXT,
          user_agent TEXT,
          action TEXT DEFAULT 'view',
          accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('PostgreSQL tables initialized');
    } finally {
      client.release();
    }
  }

  async _seedData() {
    const uc = await this.get('SELECT COUNT(*) as count FROM users');
    if (parseInt(uc.count) === 0) {
      const hashedPw = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await this.run(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        [process.env.ADMIN_EMAIL || 'admin@bungkus.com', hashedPw, 'Admin User', 'admin']
      );
      console.log('Default admin user created (bcrypt hashed)');
    }

    const cc = await this.get('SELECT COUNT(*) as count FROM clients');
    if (parseInt(cc.count) === 0) {
      const clients = [
        ['PT Maju Bersama', 'PT Maju Bersama', 'contact@majubersama.com', '+62 812-3456-7890', 'Jl. Industri No. 10, Jakarta Selatan', '01.234.567.8-901.000', 'Jakarta Selatan', 'active', 45000000],
        ['CV Berkah Packaging', 'CV Berkah Packaging', 'hello@berkahpack.com', '+62 813-9876-5432', 'Jl. Raya Bandung No. 5', '02.345.678.9-012.000', 'Bandung', 'active', 28000000],
        ['UD Sejahtera', 'UD Sejahtera', 'info@sejahtera.com', '+62 811-2345-6789', 'Jl. Pahlawan No. 15, Surabaya', '03.456.789.0-123.000', 'Surabaya', 'inactive', 12000000],
        ['PT Nusantara Foods', 'PT Nusantara Foods', 'order@nusantarafoods.com', '+62 814-5678-9012', 'Jl. Malioboro No. 20, Yogyakarta', '04.567.890.1-234.000', 'Yogyakarta', 'active', 18500000]
      ];
      for (const c of clients) {
        await this.run(
          'INSERT INTO clients (name, company_name, email, phone, address, npwp, location, status, revenue) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', c
        );
      }
      console.log('Sample clients inserted');
    }

    const oc = await this.get('SELECT COUNT(*) as count FROM orders');
    if (parseInt(oc.count) === 0) {
      const orders = [
        ['ORD-2026-001', 1, 15000000, 0, 1650000, 16650000, 'dp', 'production', 'Dus makanan custom print full color', '2026-04-15'],
        ['ORD-2026-002', 2, 8500000, 500000, 880000, 8880000, 'unpaid', 'pending', 'Paper bag kraft polos', '2026-04-20'],
        ['ORD-2026-003', 4, 22000000, 1000000, 2310000, 23310000, 'lunas', 'shipped', 'Standing pouch custom untuk snack', '2026-04-10'],
        ['ORD-2026-004', 1, 5000000, 0, 550000, 5550000, 'lunas', 'delivered', 'Sticker label produk', '2026-03-25']
      ];
      for (const o of orders) {
        await this.run(
          'INSERT INTO orders (order_number, client_id, subtotal, discount, tax_amount, total_amount, payment_status, production_status, notes, due_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', o
        );
      }

      const items = [
        [1, 'Dus Makanan 20x15x8cm', 'Dus makanan dengan tutup', 'Duplex 310gsm', '20x15x8cm', 'Full Color Offset', 5000, 3000, 15000000],
        [2, 'Paper Bag Kraft M', 'Paper bag ukuran medium', 'Kraft 150gsm', '25x10x30cm', 'Polos', 2000, 4250, 8500000],
        [3, 'Standing Pouch 14x22cm', 'Standing pouch dengan zipper', 'Aluminium Foil', '14x22cm', 'Digital Print', 10000, 2200, 22000000],
        [4, 'Sticker Label 5x3cm', 'Sticker label produk waterproof', 'Vinyl', '5x3cm', 'Digital Print', 10000, 500, 5000000]
      ];
      for (const i of items) {
        await this.run(
          'INSERT INTO order_items (order_id, item_name, description, material, size, print_type, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', i
        );
      }

      await this.run(
        'INSERT INTO shipments (order_id, tracking_number, courier, service_type, status, estimated_delivery, actual_delivery, shipping_address, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [4, 'JNE1234567890', 'JNE', 'REG', 'delivered', '2026-03-28', '2026-03-27', 'Jl. Industri No. 10, Jakarta Selatan', 'Diterima oleh security']
      );
      await this.run(
        'INSERT INTO shipments (order_id, tracking_number, courier, service_type, status, estimated_delivery, shipping_address) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [3, 'SICEPAT0098765', 'SiCepat', 'BEST', 'in_transit', '2026-04-02', 'Jl. Malioboro No. 20, Yogyakarta']
      );
      console.log('Sample orders, items, and shipments inserted');
    }
  }

  // Convert ? placeholders to $1,$2,... for pg
  _convertPlaceholders(sql) {
    let idx = 0;
    return sql.replace(/\?/g, () => `$${++idx}`);
  }

  async query(sql, params = []) {
    const pgSql = this._convertPlaceholders(sql);
    const result = await this.pool.query(pgSql, params);
    return result.rows;
  }

  async run(sql, params = []) {
    const pgSql = this._convertPlaceholders(sql);
    const result = await this.pool.query(pgSql + ' RETURNING id', params).catch(async () => {
      // Fallback without RETURNING (for UPDATE/DELETE)
      const r = await this.pool.query(pgSql, params);
      return { rows: [{}], rowCount: r.rowCount };
    });
    return { id: result.rows[0]?.id, changes: result.rowCount };
  }

  async get(sql, params = []) {
    const pgSql = this._convertPlaceholders(sql);
    const result = await this.pool.query(pgSql, params);
    return result.rows[0] || null;
  }
}

// ─── SQLite adapter ────────────────────────────────────────────────────────────
class SQLiteAdapter {
  constructor() {
    const sqlite3 = require('sqlite3').verbose();
    this.ready = new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(
        process.env.SQLITE_PATH || path.join(__dirname, '../../bungkus.db'),
        (err) => {
          if (err) {
            console.error('Error connecting to SQLite:', err.message);
            reject(err);
          } else {
            console.log('Connected to SQLite database');
            this.db.run('PRAGMA foreign_keys = ON');
            this._initializeTables().then(resolve).catch(reject);
          }
        }
      );
    });
  }

  _initializeTables() {
    return new Promise((resolve) => {
      this.db.serialize(() => {
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
          )
        `);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, company_name TEXT, email TEXT UNIQUE NOT NULL,
            phone TEXT, address TEXT, npwp TEXT, location TEXT,
            status TEXT DEFAULT 'active',
            join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            revenue INTEGER DEFAULT 0
          )
        `);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            client_id INTEGER NOT NULL,
            subtotal INTEGER DEFAULT 0, discount INTEGER DEFAULT 0,
            tax_amount INTEGER DEFAULT 0, total_amount INTEGER DEFAULT 0,
            payment_status TEXT DEFAULT 'unpaid',
            production_status TEXT DEFAULT 'pending',
            packaging_details TEXT, notes TEXT, due_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, completed_at DATETIME,
            FOREIGN KEY (client_id) REFERENCES clients(id)
          )
        `);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL, item_name TEXT NOT NULL,
            description TEXT, material TEXT, size TEXT, print_type TEXT,
            quantity INTEGER DEFAULT 1, unit_price INTEGER DEFAULT 0,
            total_price INTEGER DEFAULT 0, specifications TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
          )
        `);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL, invoice_number TEXT UNIQUE NOT NULL,
            subtotal INTEGER DEFAULT 0, tax_amount INTEGER DEFAULT 0,
            total_amount INTEGER DEFAULT 0, due_date DATETIME,
            status TEXT DEFAULT 'draft', file_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
          )
        `);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS tax_invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL, invoice_id INTEGER,
            faktur_number TEXT UNIQUE NOT NULL, npwp TEXT NOT NULL,
            company_name TEXT NOT NULL, tax_amount INTEGER DEFAULT 0,
            file_path TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id)
          )
        `);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS shipments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL, tracking_number TEXT, courier TEXT,
            service_type TEXT, status TEXT DEFAULT 'pending',
            estimated_delivery DATETIME, actual_delivery DATETIME,
            shipping_address TEXT, notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
          )
        `);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS qr_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL, secret_hash TEXT UNIQUE NOT NULL,
            is_active INTEGER DEFAULT 1, expires_at DATETIME,
            access_count INTEGER DEFAULT 0, last_accessed DATETIME, last_ip TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
          )
        `);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS qr_delivery_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            qr_id INTEGER NOT NULL, delivery_method TEXT NOT NULL,
            recipient TEXT, delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            delivered_by INTEGER,
            FOREIGN KEY (qr_id) REFERENCES qr_codes(id) ON DELETE CASCADE,
            FOREIGN KEY (delivered_by) REFERENCES users(id)
          )
        `);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            qr_id INTEGER NOT NULL, ip_address TEXT, user_agent TEXT,
            action TEXT DEFAULT 'view',
            accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (qr_id) REFERENCES qr_codes(id) ON DELETE CASCADE
          )
        `, () => {
          this._seedData().then(resolve);
        });
      });
    });
  }

  async _seedData() {
    try {
      const uc = await this.get('SELECT COUNT(*) as count FROM users');
      if (uc.count === 0) {
        const hashedPw = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
        await this.run('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
          [process.env.ADMIN_EMAIL || 'admin@bungkus.com', hashedPw, 'Admin User', 'admin']);
        console.log('Default admin user created (bcrypt hashed)');
      }

      const cc = await this.get('SELECT COUNT(*) as count FROM clients');
      if (cc.count === 0) {
        const clients = [
          ['PT Maju Bersama', 'PT Maju Bersama', 'contact@majubersama.com', '+62 812-3456-7890', 'Jl. Industri No. 10, Jakarta Selatan', '01.234.567.8-901.000', 'Jakarta Selatan', 'active', 45000000],
          ['CV Berkah Packaging', 'CV Berkah Packaging', 'hello@berkahpack.com', '+62 813-9876-5432', 'Jl. Raya Bandung No. 5', '02.345.678.9-012.000', 'Bandung', 'active', 28000000],
          ['UD Sejahtera', 'UD Sejahtera', 'info@sejahtera.com', '+62 811-2345-6789', 'Jl. Pahlawan No. 15, Surabaya', '03.456.789.0-123.000', 'Surabaya', 'inactive', 12000000],
          ['PT Nusantara Foods', 'PT Nusantara Foods', 'order@nusantarafoods.com', '+62 814-5678-9012', 'Jl. Malioboro No. 20, Yogyakarta', '04.567.890.1-234.000', 'Yogyakarta', 'active', 18500000]
        ];
        for (const c of clients) {
          await this.run('INSERT INTO clients (name, company_name, email, phone, address, npwp, location, status, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', c);
        }
        console.log('Sample clients inserted');
      }

      const oc = await this.get('SELECT COUNT(*) as count FROM orders');
      if (oc.count === 0) {
        const orders = [
          ['ORD-2026-001', 1, 15000000, 0, 1650000, 16650000, 'dp', 'production', 'Dus makanan custom print full color', '2026-04-15'],
          ['ORD-2026-002', 2, 8500000, 500000, 880000, 8880000, 'unpaid', 'pending', 'Paper bag kraft polos', '2026-04-20'],
          ['ORD-2026-003', 4, 22000000, 1000000, 2310000, 23310000, 'lunas', 'shipped', 'Standing pouch custom untuk snack', '2026-04-10'],
          ['ORD-2026-004', 1, 5000000, 0, 550000, 5550000, 'lunas', 'delivered', 'Sticker label produk', '2026-03-25']
        ];
        for (const o of orders) {
          await this.run('INSERT INTO orders (order_number, client_id, subtotal, discount, tax_amount, total_amount, payment_status, production_status, notes, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', o);
        }
        const items = [
          [1, 'Dus Makanan 20x15x8cm', 'Dus makanan dengan tutup', 'Duplex 310gsm', '20x15x8cm', 'Full Color Offset', 5000, 3000, 15000000],
          [2, 'Paper Bag Kraft M', 'Paper bag ukuran medium', 'Kraft 150gsm', '25x10x30cm', 'Polos', 2000, 4250, 8500000],
          [3, 'Standing Pouch 14x22cm', 'Standing pouch dengan zipper', 'Aluminium Foil', '14x22cm', 'Digital Print', 10000, 2200, 22000000],
          [4, 'Sticker Label 5x3cm', 'Sticker label produk waterproof', 'Vinyl', '5x3cm', 'Digital Print', 10000, 500, 5000000]
        ];
        for (const i of items) {
          await this.run('INSERT INTO order_items (order_id, item_name, description, material, size, print_type, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', i);
        }
        await this.run(
          'INSERT INTO shipments (order_id, tracking_number, courier, service_type, status, estimated_delivery, actual_delivery, shipping_address, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [4, 'JNE1234567890', 'JNE', 'REG', 'delivered', '2026-03-28', '2026-03-27', 'Jl. Industri No. 10, Jakarta Selatan', 'Diterima oleh security']
        );
        await this.run(
          'INSERT INTO shipments (order_id, tracking_number, courier, service_type, status, estimated_delivery, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [3, 'SICEPAT0098765', 'SiCepat', 'BEST', 'in_transit', '2026-04-02', 'Jl. Malioboro No. 20, Yogyakarta']
        );
        console.log('Sample orders, items, and shipments inserted');
      }
    } catch (error) {
      console.error('Seed data error:', error.message);
    }
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err); else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });
  }
}

// ─── Export unified interface ──────────────────────────────────────────────────
console.log(`Database mode: ${DB_TYPE}`);
const adapter = DB_TYPE === 'postgres' ? new PostgresAdapter() : new SQLiteAdapter();

module.exports = {
  query: (sql, params) => adapter.query(sql, params),
  run: (sql, params) => adapter.run(sql, params),
  get: (sql, params) => adapter.get(sql, params),
  dbType: DB_TYPE
};
