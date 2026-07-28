const express = require('express');
const router = express.Router();
const { Product, Notification, sequelize } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

router.use(authenticate);

// Get all products
router.get('/', authorize(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, filter } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (filter === 'low-stock') {
      where[Op.and] = [
        sequelize.where(sequelize.col('quantity'), '<=', sequelize.col('lowStockThreshold'))
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products alert
router.get('/low-stock/alert', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const products = await Product.findAll({
      where: sequelize.where(sequelize.col('quantity'), '<=', sequelize.col('lowStockThreshold'))
    });

    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', authorize(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update(req.body);
    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update stock
router.patch('/:id/stock', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update({ quantity });

    // Create notification if stock is low
    if (quantity <= product.lowStockThreshold) {
      await Notification.create({
        userId: req.user.id,
        type: 'inventory',
        title: 'Low Stock Alert',
        message: `${product.name} stock is below threshold (${quantity} units)`,
        relatedId: product.id,
        relatedType: 'product'
      });
    }

    res.json({ message: 'Stock updated', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
