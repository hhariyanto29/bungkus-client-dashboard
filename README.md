# Bungkus Client Dashboard

Custom packaging system with confidential QR code access for order management.

## Features

- **QR Confidential Access**: Unique QR code per order provides secure access without login
- **Order Status Tracking**: Real-time status updates (Deal/Unpaid/DP/Lunas/Completed)
- **Shipment Tracking**: Integration with JNE, TIKI, POS Indonesia, and custom couriers
- **Invoice Management**: Automated PDF invoice generation with tax calculation
- **Tax Invoice (Faktur Pajak)**: Integration with E-Faktur API
- **Order History**: Complete timeline view of order progress and communications

## System Architecture

```
Customer Order → Generate Unique QR → Portal Access → Secure Dashboard
```

### QR Structure
```
https://portal.domain.com/access/{order_id}/{secret_hash}
```

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL / SQLite
- Redis (caching & sessions)
- PDFKit (invoice generation)
- JWT (QR authentication)

### Frontend
- React.js
- Tailwind CSS
- QRCode.js
- Chart.js (analytics)
- React Router

### Third-party Integrations
- Midtrans/QRIS (payments)
- RajaOngkir (shipping rates)
- E-Faktur API (tax invoices)
- WhatsApp API (notifications)
- JNE/TIKI/POS API (tracking)

## Project Structure

```
bungkus-client-dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── public/
├── admin/
│   └── (admin dashboard)
├── docs/
│   └── (documentation)
└── docker/
    └── (docker configurations)
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or SQLite for development)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hhariyanto29/bungkus-client-dashboard.git
cd bungkus-client-dashboard
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run the development servers:
```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm start
```

## Development Phases

### Phase 1: Core MVP (2-3 weeks)
- QR generation system
- Basic portal with order status
- Admin dashboard
- Database design

### Phase 2: Essential Features (1-2 weeks)
- Invoice generation (PDF)
- Tracking integration
- Payment gateway integration
- Enhanced security

### Phase 3: Polish & Deployment (1 week)
- Mobile responsiveness
- Performance optimization
- Production deployment
- Documentation

## API Documentation

### QR Access Endpoint
```
GET /api/access/:orderId/:hash
```
Returns order details for valid QR code access.

### Order Status
```
GET /api/orders/:orderId/status
```
Returns current order status and timeline.

### Invoice Generation
```
POST /api/orders/:orderId/invoice
```
Generates and returns PDF invoice.

## Security Features

- 256-bit encryption for QR hash
- QR expiration (default: 30 days)
- Rate limiting (50 accesses/day per QR)
- IP logging for security audit
- HTTPS enforcement
- CORS configuration

## Deployment

### Option 1: Vercel + Railway
- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

### Option 2: Docker
```bash
docker-compose up -d
```

### Option 3: Manual
- Nginx reverse proxy
- PM2 process management
- SSL via Let's Encrypt

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Proprietary - All rights reserved.

## Contact

For questions or support, contact the development team.