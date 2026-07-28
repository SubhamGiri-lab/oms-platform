const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, Customer } = require('../models');
const { Op } = require('sequelize');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Get sales overview
router.get('/sales/overview', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    const totalOrders = await Order.count({ where });
    const totalRevenue = await Order.sum('total', { where });
    const avgOrderValue = totalRevenue / totalOrders || 0;
    const totalCustomers = await Customer.count();

    res.json({
      totalOrders,
      totalRevenue,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      totalCustomers,
      period: { startDate, endDate }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales by date
router.get('/sales/by-date', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'orders'],
        [require('sequelize').fn('SUM', require('sequelize').col('total')), 'revenue']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: [require('sequelize').fn('DATE', require('sequelize').col('createdAt'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']],
      raw: true
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top products
router.get('/products/top', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'totalSold'],
        [require('sequelize').fn('SUM', require('sequelize').literal('quantity * "unitPrice"')), 'revenue']
      ],
      include: [{ model: Product, attributes: ['name', 'sku', 'price'] }],
      group: ['productId', 'Product.id'],
      order: [[require('sequelize').literal('revenue'), 'DESC']],
      limit: parseInt(limit),
      raw: false,
      subQuery: false
    });

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order status distribution
router.get('/orders/status-distribution', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const distribution = await Order.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top customers
router.get('/customers/top', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topCustomers = await Customer.findAll({
      attributes: ['id', 'name', 'email', 'totalOrders', 'totalSpent'],
      order: [['totalSpent', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(topCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
