const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(authenticate);

// Get all orders (managers and admins can view all, staff can view assigned)
router.get('/', authorize(['admin', 'manager', 'staff']), orderController.getOrders);

// Create new order
router.post('/', authorize(['admin', 'manager']), orderController.createOrder);

// Get single order
router.get('/:id', authorize(['admin', 'manager', 'staff']), orderController.getOrder);

// Update order status
router.patch('/:id/status', authorize(['admin', 'manager']), orderController.updateOrderStatus);

// Update payment status
router.patch('/:id/payment', authorize(['admin', 'manager']), orderController.updatePaymentStatus);

// Cancel order
router.post('/:id/cancel', authorize(['admin', 'manager']), orderController.cancelOrder);

// Delete order (only pending orders)
router.delete('/:id', authorize(['admin']), orderController.deleteOrder);

module.exports = router;
