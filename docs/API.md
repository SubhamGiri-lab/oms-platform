# OMS API Documentation

## Authentication

All API endpoints require JWT authentication except login/register endpoints.

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "manager"
  }
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "staff"
}
```

## Orders Endpoints

### List Orders
```
GET /api/orders?page=1&limit=20&status=pending&sortBy=createdAt
Authorization: Bearer {token}

Response:
{
  "data": [...],
  "pagination": {
    "total": 124,
    "page": 1,
    "pages": 7
  }
}
```

### Create Order
```
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "discount": 0
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345",
  "notes": "Handle with care",
  "priority": "normal"
}

Response:
{
  "message": "Order created successfully",
  "order": {
    "id": "order-uuid",
    "orderNumber": "ORD-20240215-0001",
    "total": "$2,450.00",
    ...
  }
}
```

### Get Order Details
```
GET /api/orders/{orderId}
Authorization: Bearer {token}

Response:
{
  "id": "order-uuid",
  "orderNumber": "ORD-20240215-0001",
  "customerId": "customer-uuid",
  "status": "processing",
  "total": "2450.00",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "unitPrice": "1225.00"
    }
  ]
}
```

### Update Order Status
```
PATCH /api/orders/{orderId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "shipped"
}

Valid statuses: pending, confirmed, processing, shipped, delivered, cancelled
```

### Update Payment Status
```
PATCH /api/orders/{orderId}/payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentStatus": "paid"
}

Valid statuses: pending, paid, failed, refunded
```

### Cancel Order
```
POST /api/orders/{orderId}/cancel
Authorization: Bearer {token}
```

## Customers Endpoints

### List Customers
```
GET /api/customers?page=1&limit=20&status=active
Authorization: Bearer {token}
```

### Create Customer
```
POST /api/customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0100",
  "company": "Tech Corp",
  "address": "456 Oak Ave",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94103",
  "country": "USA"
}
```

### Get Customer Details
```
GET /api/customers/{customerId}
Authorization: Bearer {token}

Includes recent orders and customer statistics
```

### Update Customer
```
PUT /api/customers/{customerId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Smith Updated",
  "email": "jane.new@example.com",
  ...
}
```

## Inventory Endpoints

### List Products
```
GET /api/inventory?page=1&limit=20&status=active
Authorization: Bearer {token}
```

### Create Product
```
POST /api/inventory
Authorization: Bearer {token}
Content-Type: application/json

{
  "sku": "PROD-001",
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "cost": 50.00,
  "quantity": 100,
  "lowStockThreshold": 10,
  "category": "Electronics"
}
```

### Update Stock
```
PATCH /api/inventory/{productId}/stock
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 75
}
```

## Analytics Endpoints

### Sales Overview
```
GET /api/analytics/sales/overview?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}

Response:
{
  "totalOrders": 125,
  "totalRevenue": "45231.89",
  "avgOrderValue": "361.85",
  "totalCustomers": 87
}
```

### Sales by Date
```
GET /api/analytics/sales/by-date?days=30
Authorization: Bearer {token}

Returns daily sales data for the last 30 days
```

### Top Products
```
GET /api/analytics/products/top?limit=10
Authorization: Bearer {token}
```

### Order Status Distribution
```
GET /api/analytics/orders/status-distribution
Authorization: Bearer {token}
```

### Top Customers
```
GET /api/analytics/customers/top?limit=10
Authorization: Bearer {token}
```

## Notifications Endpoints

### Get Notifications
```
GET /api/notifications?unread=false
Authorization: Bearer {token}
```

### Get Unread Count
```
GET /api/notifications/unread/count
Authorization: Bearer {token}
```

### Mark Notification as Read
```
PATCH /api/notifications/{notificationId}/read
Authorization: Bearer {token}
```

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "status": 400
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

Currently no rate limiting is implemented but it's recommended for production:
- 100 requests per minute per user
- 1000 requests per hour per user

## Pagination

Use `page` and `limit` query parameters:
```
?page=1&limit=20
```

Returns pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 124,
    "page": 1,
    "pages": 7
  }
}
```

## Real-Time Updates

The API uses WebSocket for real-time updates:

```javascript
const socket = io('http://localhost:5000');

socket.on('order_created', (data) => {
  console.log('New order:', data);
});

socket.on('order_status_changed', (data) => {
  console.log('Order status updated:', data);
});
```
