const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(
      path.join(__dirname, '../../bungkus.db'),
      (err) => {
        if (err) {
          console.error('Error connecting to database:', err.message);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables();
        }
      }
    );
  }

  initializeTables() {
    // Users table for authentication
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

    // Clients table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        location TEXT,
        tables INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        revenue INTEGER DEFAULT 0
      )
    `);

    // Orders table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        client_id INTEGER,
        client_name TEXT NOT NULL,
        table_number TEXT,
        items TEXT NOT NULL, -- JSON string of items
        total_amount INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // QR Codes table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        table_number TEXT NOT NULL,
        qr_data TEXT NOT NULL,
        valid_until DATETIME,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // Insert default admin user if not exists
    this.db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('Error checking users:', err.message);
        return;
      }
      
      if (row.count === 0) {
        const defaultPassword = 'admin123'; // In production, use environment variable
        // In real app, hash this password
        this.db.run(
          'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
          ['admin@bungkus.com', defaultPassword, 'Admin User', 'admin'],
          (err) => {
            if (err) {
              console.error('Error inserting default user:', err.message);
            } else {
              console.log('Default admin user created');
            }
          }
        );
      }
    });

    // Insert sample clients if not exists
    this.db.get('SELECT COUNT(*) as count FROM clients', (err, row) => {
      if (err) {
        console.error('Error checking clients:', err.message);
        return;
      }
      
      if (row.count === 0) {
        const sampleClients = [
          ['Restaurant ABC', 'contact@restaurantabc.com', '+62 812-3456-7890', 'Jakarta Selatan', 20, 'active', 45000000],
          ['Cafe XYZ', 'hello@cafexyz.com', '+62 813-9876-5432', 'Bandung', 12, 'active', 28000000],
          ['Bistro 123', 'info@bistro123.com', '+62 811-2345-6789', 'Surabaya', 15, 'inactive', 12000000],
          ['Warung Makan Sederhana', 'warung@sederhana.com', '+62 814-5678-9012', 'Yogyakarta', 8, 'active', 18500000]
        ];

        sampleClients.forEach(client => {
          this.db.run(
            'INSERT INTO clients (name, email, phone, location, tables, status, revenue) VALUES (?, ?, ?, ?, ?, ?, ?)',
            client,
            (err) => {
              if (err) console.error('Error inserting sample client:', err.message);
            }
          );
        });
        console.log('Sample clients inserted');
      }
    });

    // Insert sample orders if not exists
    this.db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
      if (err) {
        console.error('Error checking orders:', err.message);
        return;
      }
      
      if (row.count === 0) {
        const sampleOrders = [
          ['ORD-001', 1, 'John Doe', 'Table 5', JSON.stringify([
            { name: 'Nasi Goreng Special', qty: 2, price: 35000 },
            { name: 'Es Teh Manis', qty: 2, price: 5000 }
          ]), 80000, 'pending', 'Extra pedas untuk nasi goreng'],
          ['ORD-002', 2, 'Jane Smith', 'Table 12', JSON.stringify([
            { name: 'Ayam Bakar', qty: 1, price: 45000 },
            { name: 'Sate Ayam', qty: 2, price: 20000 }
          ]), 85000, 'processing', ''],
          ['ORD-003', 3, 'Bob Johnson', 'Table 3', JSON.stringify([
            { name: 'Mie Ayam Special', qty: 3, price: 25000 },
            { name: 'Jus Alpukat', qty: 3, price: 15000 }
          ]), 120000, 'completed', 'Mie tidak pakai sayur'],
          ['ORD-004', 4, 'Alice Brown', 'Table 8', JSON.stringify([
            { name: 'Soto Ayam', qty: 1, price: 30000 },
            { name: 'Teh Botol', qty: 1, price: 8000 }
          ]), 38000, 'completed', '']
        ];

        sampleOrders.forEach(order => {
          this.db.run(
            'INSERT INTO orders (order_number, client_id, client_name, table_number, items, total_amount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            order,
            (err) => {
              if (err) console.error('Error inserting sample order:', err.message);
            }
          );
        });
        console.log('Sample orders inserted');
      }
    });
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

const database = new Database();

// Export the database instance with its methods
module.exports = {
  query: (sql, params) => database.query(sql, params),
  run: (sql, params) => database.run(sql, params),
  get: (sql, params) => database.get(sql, params),
  db: database.db // For direct access if needed
};