# Order Management System (OMS)

A modern, full-stack Order Management System with intuitive UI, real-time updates, and comprehensive analytics.

![OMS Dashboard](./docs/screenshots/dashboard.png)

## 🎯 Features

- **Dashboard** - Real-time order metrics, sales overview, and key performance indicators
- **Order Management** - Create, view, edit, and track orders with full status workflow
- **Customer Management** - Maintain customer profiles, contact info, and order history
- **Inventory Tracking** - Monitor stock levels and automatic low-stock alerts
- **Analytics & Reports** - Comprehensive sales analytics with exportable reports
- **User Management** - Role-based access control (Admin, Manager, Staff)
- **Notifications** - Real-time alerts for order updates and system events
- **Mobile Responsive** - Fully responsive design that works on all devices

## 🚀 Quick Start

### Option 1: Run with Docker (recommended)

This project is set up so you can clone it and run the full stack with Docker Compose.

```bash
docker compose up --build
docker compose ps
```

Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- pgAdmin: http://localhost:5050

### Default login
Use these credentials for the seeded admin account:
- Email: admin@example.com
- Password: Password123!

### Prerequisites for manual setup
- Node.js >= 16.0.0
- PostgreSQL >= 12
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Update .env with your database credentials
DATABASE_URL=postgresql://user:password@localhost:5432/oms_db
JWT_SECRET=your_secret_key_here
PORT=5000

# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env

# Update .env with backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📁 Project Structure

```
oms-project/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── migrations/
│   ├── seeds/
│   ├── tests/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   ├── (dashboard)/
│   │   ├── (orders)/
│   │   ├── (customers)/
│   │   ├── (analytics)/
│   │   └── layout.js
│   ├── public/
│   ├── styles/
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
└── docker-compose.yml
```

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (React 18)
- Tailwind CSS for styling
- React Query for data fetching
- Chart.js for analytics
- Zustand for state management

**Backend:**
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Socket.io for real-time updates

**DevOps:**
- Docker & Docker Compose
- GitHub Actions for CI/CD
- PostgreSQL with migrations

## 🔐 Authentication

The system uses JWT-based authentication with role-based access control:

- **Admin** - Full system access
- **Manager** - Order and customer management
- **Staff** - View-only access to orders and customers

## 📊 Database Schema

Key tables:
- `users` - User accounts and authentication
- `customers` - Customer information
- `orders` - Order records
- `order_items` - Individual items in orders
- `inventory` - Product stock management
- `notifications` - System and user notifications

## 🛠️ Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed sample data
npm test             # Run tests
npm run lint         # Run linter
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

## 📚 API Documentation

Comprehensive API documentation is available in `docs/API.md`

Common endpoints:
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/customers` - List customers
- `POST /api/customers` - Add customer
- `GET /api/analytics/sales` - Sales analytics

## 🐳 Docker Deployment

```bash
docker compose up --build -d
```

This starts:
- Frontend (port 3000)
- Backend API (port 5001)
- PostgreSQL database (port 5432)
- pgAdmin (port 5050)

## 📈 Monitoring & Analytics

Built-in analytics dashboard showing:
- Total sales and revenue trends
- Order completion rates
- Customer acquisition metrics
- Top-performing products
- Inventory turnover analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review API docs for endpoint details

---

**Made with ❤️ for efficient order management**
