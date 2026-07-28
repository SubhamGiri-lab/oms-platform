const { Order, OrderItem, Customer, Product, Notification, User } = require('../models');
const { Op } = require('sequelize');

// Generate unique order number
const generateOrderNumber = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Order.count({
    where: {
      createdAt: {
        [Op.gte]: new Date(date.setHours(0, 0, 0, 0)),
        [Op.lt]: new Date(date.setHours(23, 59, 59, 999))
      }
    }
  });
  return `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { customerId, items, shippingAddress, notes, priority } = req.body;
    
    // Validate customer exists
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const lineTotal = product.price * item.quantity - (item.discount || 0);
      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        discount: item.discount || 0
      });
    }

    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = subtotal > 500 ? 0 : 10; // Free shipping over $500
    const total = subtotal + tax + shippingCost;

    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await Order.create({
      orderNumber,
      customerId,
      subtotal,
      tax,
      shippingCost,
      total,
      shippingAddress: shippingAddress || customer.address,
      notes,
      priority: priority || 'normal',
      createdBy: req.user.id,
      status: 'pending'
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      });

      // Reduce inventory
      const product = await Product.findByPk(item.productId);
      await product.update({
        quantity: product.quantity - item.quantity
      });
    }

    // Update customer stats
    await customer.update({
      totalOrders: customer.totalOrders + 1,
      totalSpent: customer.totalSpent + total
    });

    // Create notification
    await Notification.create({
      userId: req.user.id,
      type: 'order',
      title: 'New Order Created',
      message: `Order ${orderNumber} created for ${customer.name}`,
      relatedId: order.id,
      relatedType: 'order'
    });

    // Broadcast to connected clients
    req.io.emit('order_created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: customer.name,
      total: order.total
    });

    const orderWithItems = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, include: [Product] },
        { model: Customer },
        { model: User, as: 'creator', attributes: ['name'] }
      ]
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: orderWithItems
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customerId, sortBy = 'createdAt' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Customer, attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['name'] }
      ],
      order: [[sortBy, 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          include: [{ model: Product }]
        },
        { model: Customer },
        { model: User, as: 'creator', attributes: ['name', 'email'] }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const oldStatus = order.status;
    await order.update({ status });

    // Notify customer of status change
    const customer = await order.getCustomer();
    await Notification.create({
      userId: req.user.id,
      type: 'order',
      title: 'Order Status Updated',
      message: `Order ${order.orderNumber} status changed from ${oldStatus} to ${status}`,
      relatedId: order.id,
      relatedType: 'order'
    });

    // Broadcast status change
    req.io.emit('order_status_changed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status,
      customerName: customer.name
    });

    res.json({
      message: 'Order status updated',
      order: await Order.findByPk(req.params.id, {
        include: [OrderItem, Customer]
      })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ paymentStatus });

    res.json({
      message: 'Payment status updated',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [OrderItem]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ error: 'Cannot cancel shipped or delivered orders' });
    }

    // Restore inventory
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId);
      await product.update({
        quantity: product.quantity + item.quantity
      });
    }

    await order.update({ status: 'cancelled' });

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending orders' });
    }

    await order.destroy();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
