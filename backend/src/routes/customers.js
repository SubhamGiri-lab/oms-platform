const express = require('express');
const router = express.Router();
const { Customer, Order } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Get all customers
router.get('/', authorize(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Customer.findAndCountAll({
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

// Create customer
router.post('/', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ message: 'Customer created', customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer details
router.get('/:id', authorize(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          attributes: ['id', 'orderNumber', 'total', 'status', 'createdAt'],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    await customer.update(req.body);
    res.json({ message: 'Customer updated', customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    await customer.destroy();
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
