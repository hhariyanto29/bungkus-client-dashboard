# 🍱 Bungkus Admin Dashboard

Modern admin dashboard for restaurant management with QR code ordering system. Built with React 19, TypeScript, Tailwind CSS, and Express.js backend.

## ✨ Features

### 🎨 Modern Design
- **Glassmorphism UI** with gradient backgrounds
- **Dark/Light mode** toggle
- **Smooth animations** with Framer Motion
- **Responsive design** for all devices
- **Real-time data** updates

### 🔐 Authentication & Security
- **JWT-based authentication**
- **Protected routes** with role-based access
- **Secure API endpoints**
- **Token refresh** mechanism

### 📊 Dashboard
- **Real-time statistics** and analytics
- **Order management** with status tracking
- **Client directory** with card layout
- **QR code generator** with bulk generation
- **Revenue tracking** and reporting

### 🛠️ Technical Features
- **TypeScript** for type safety
- **React Query** for data fetching
- **Axios** for API calls
- **SQLite database** with automatic migrations
- **RESTful API** with proper error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Installation & Running

#### Option 1: Using Start Script (Recommended)
```bash
# Make script executable
chmod +x start.sh

# Run the application
./start.sh
```

#### Option 2: Manual Setup
```bash
# 1. Clone and navigate to project
cd bungkus-client-dashboard

# 2. Start Backend
cd backend
npm install
npm run dev

# 3. Start Frontend (in new terminal)
cd admin
npm install
npm start
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Default Admin Credentials
- **Email**: admin@bungkus.com
- **Password**: admin123

## 📁 Project Structure

```
bungkus-client-dashboard/
├── admin/                    # Frontend React App
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # Global styles
│   └── package.json
│
├── backend/                 # Express.js Backend
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── bungkus.db          # SQLite database
│   └── package.json
│
├── start.sh                # Startup script
└── README.md              # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Query** - Data fetching
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Express.js** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication
- **CORS** - Cross-origin support
- **QRCode** - QR generation

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status

### QR Codes
- `POST /api/qr/generate` - Generate QR code
- `GET /api/qr` - Get all QR codes
- `POST /api/qr/validate` - Validate QR code
- `POST /api/qr/bulk-generate` - Bulk generate QR codes

## 🎨 Design System

### Colors
- **Primary**: Purple (#8B5CF6) to Pink (#EC4899) gradient
- **Secondary**: Blue (#3B82F6) to Cyan (#06B6D4) gradient
- **Success**: Green (#10B981) to Emerald (#059669) gradient
- **Warning**: Orange (#F59E0B) to Red (#EF4444) gradient
- **Dark Mode**: Dark gray (#1F2937) background

### Typography
- **Font Family**: Inter (via Tailwind CSS)
- **Headings**: Bold with gradient text
- **Body**: Regular weight with good contrast

### Components
- **Cards**: Glassmorphism with blur effects
- **Buttons**: Gradient backgrounds with hover effects
- **Tables**: Modern design with status indicators
- **Forms**: Clean design with validation

## 🔧 Development

### Frontend Development
```bash
cd admin
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run linter
```

### Backend Development
```bash
cd backend
npm run dev        # Start development server
npm start          # Start production server
npm run test       # Run tests
```

### Database
The application uses SQLite3 with automatic table creation. The database file is located at `backend/bungkus.db`.

To reset the database:
```bash
rm backend/bungkus.db
npm run dev        # Tables will be recreated automatically
```

## 📱 Pages

### 1. Login Page
- Modern authentication form
- Error handling and validation
- Remember me functionality

### 2. Dashboard
- Real-time statistics cards
- Recent orders table
- Quick action buttons
- Revenue charts

### 3. QR Generator
- QR code generation form
- Bulk QR generation
- QR code preview and download
- QR code management table

### 4. Orders Management
- Order listing with filters
- Order status management
- Order creation and editing
- Order details view

### 5. Clients Directory
- Client cards with details
- Client search and filtering
- Client statistics
- Client management

## 🔒 Security Features

- **JWT Authentication** with 24-hour expiry
- **Password hashing** (in production use bcrypt)
- **Protected API endpoints**
- **CORS configuration**
- **Input validation** and sanitization
- **SQL injection prevention**

## 🚀 Deployment

### Frontend Deployment (GitHub Pages)
```bash
cd admin
npm run build
npm run deploy
```

### Backend Deployment
1. Set environment variables in production
2. Use PM2 or similar process manager
3. Configure reverse proxy (Nginx)
4. Set up SSL certificate

### Environment Variables
Create `.env` files in both `admin/` and `backend/` directories:

**Backend (.env)**
```env
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

**Frontend (.env)**
```env
REACT_APP_API_URL=https://api.yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Design inspiration from modern UI trends
- Icons from Lucide React
- Animations from Framer Motion
- Styling with Tailwind CSS

## 📞 Support

For issues and questions:
1. Check the [Issues](https://github.com/yourusername/bungkus-admin/issues) page
2. Create a new issue with detailed description
3. Email: support@bungkus.com

---

**Made with ❤️ for restaurant owners and managers**