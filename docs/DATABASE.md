# Database Schema

## Overview

The OMS database uses PostgreSQL with 6 core tables and relationships for managing orders, customers, products, and system operations.

## Tables

### Users Table
Stores user accounts and authentication data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
  isActive BOOLEAN DEFAULT true,
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Roles:**
- `admin` - Full system access, can manage users
- `manager` - Can manage orders and customers
- `staff` - View-only access to orders and customers

### Customers Table
Stores customer information and aggregated statistics.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postalCode VARCHAR(20),
  country VARCHAR(100),
  taxId VARCHAR(50),
  totalOrders INTEGER DEFAULT 0,
  totalSpent DECIMAL(12, 2) DEFAULT 0,
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
```

### Products Table
Stores product catalog and inventory information.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  quantity INTEGER DEFAULT 0,
  lowStockThreshold INTEGER DEFAULT 10,
  category VARCHAR(100),
  status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
```

### Orders Table
Stores order header information.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orderNumber VARCHAR(50) UNIQUE NOT NULL,
  customerId UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  shippingCost DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  shippingAddress TEXT,
  notes TEXT,
  createdBy UUID REFERENCES users(id),
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_orderNumber ON orders(orderNumber);
CREATE INDEX idx_orders_customerId ON orders(customerId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_createdAt ON orders(createdAt);
```

### Order Items Table
Stores individual line items within orders.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orderId UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  productId UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unitPrice DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_orderId ON order_items(orderId);
CREATE INDEX idx_order_items_productId ON order_items(productId);
```

### Notifications Table
Stores system and user notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type ENUM('order', 'inventory', 'system', 'payment') NOT NULL,
  title VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT false,
  relatedId VARCHAR(100),
  relatedType VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_userId ON notifications(userId);
CREATE INDEX idx_notifications_read ON notifications(read);
```

## Relationships

```
Users
  ├── has many Orders (via createdBy)
  └── has many Notifications (via userId)

Customers
  └── has many Orders (via customerId)

Products
  └── has many OrderItems (via productId)

Orders
  ├── belongs to Customer (via customerId)
  ├── belongs to User (via createdBy)
  └── has many OrderItems (via orderId)

OrderItems
  ├── belongs to Order (via orderId)
  └── belongs to Product (via productId)

Notifications
  └── belongs to User (via userId)
```

## Data Types

- `UUID` - Unique identifier (UUID v4)
- `VARCHAR(n)` - Character string with max length
- `TEXT` - Large text content
- `DECIMAL(p,s)` - Numeric with precision and scale
- `INTEGER` - Whole numbers
- `BOOLEAN` - True/False values
- `TIMESTAMP` - Date and time
- `ENUM` - Enumerated type with predefined values

## Constraints

- **Primary Keys** - UUID for all tables
- **Foreign Keys** - Maintain referential integrity
- **Unique Constraints** - Email, SKU, Order Number
- **Check Constraints** - Ensure data validity
- **Not Null** - Required fields
- **Default Values** - Set sensible defaults

## Indexes

Indexes are created for:
- Primary keys (automatic)
- Foreign keys (lookup performance)
- Commonly searched fields (email, status)
- Frequently sorted fields (createdAt)

## Query Examples

### Get Recent Orders with Customer Details
```sql
SELECT o.*, c.name as customer_name, u.name as created_by_name
FROM orders o
JOIN customers c ON o.customerId = c.id
LEFT JOIN users u ON o.createdBy = u.id
ORDER BY o.createdAt DESC
LIMIT 10;
```

### Get Top Customers by Total Spent
```sql
SELECT id, name, email, totalOrders, totalSpent
FROM customers
WHERE status = 'active'
ORDER BY totalSpent DESC
LIMIT 10;
```

### Get Low Stock Products
```sql
SELECT id, sku, name, quantity, lowStockThreshold
FROM products
WHERE quantity <= lowStockThreshold
AND status = 'active'
ORDER BY quantity ASC;
```

### Get Sales Summary by Date
```sql
SELECT 
  DATE(o.createdAt) as date,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_revenue,
  AVG(o.total) as avg_order_value
FROM orders o
WHERE o.createdAt >= NOW() - INTERVAL '30 days'
GROUP BY DATE(o.createdAt)
ORDER BY date DESC;
```

## Performance Optimization

1. **Indexing** - Indexes on foreign keys and frequently searched fields
2. **Partitioning** - Consider partitioning orders by date for large datasets
3. **Archiving** - Archive old order data (>1 year) to separate tables
4. **Query Optimization** - Use EXPLAIN ANALYZE for slow queries
5. **Connection Pooling** - Use connection pooling (PgBouncer) for high concurrency

## Backup Strategy

1. **Daily Backups** - Full backups at midnight UTC
2. **WAL Archiving** - Enable WAL archiving for point-in-time recovery
3. **Replication** - Set up streaming replication for high availability
4. **Testing** - Regularly test restore procedures

## Migration Strategy

When modifying schema:
1. Create migration file with timestamp
2. Write up/down migrations
3. Test migrations in staging
4. Apply to production during maintenance window
5. Monitor for issues
