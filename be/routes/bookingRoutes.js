const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { auth, isStaff } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Validation rules
const bookingValidation = [
  body('showtime.theater_id').isInt().withMessage('Valid theater ID is required'),
  body('showtime.screen_number').isInt().withMessage('Valid screen number is required'),
  body('showtime.start_time').matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('Valid start time is required (HH:MM:SS)'),
  body('showtime.end_time').matches(/^\d{2}:\d{2}:\d{2}$/).withMessage('Valid end time is required (HH:MM:SS)'),
  body('showtime.date').isISO8601().withMessage('Valid date is required'),
  body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
  body('seats.*.seat_number').notEmpty().withMessage('Valid seat number is required'),
  body('combos').optional().isArray(),
  body('combos.*.combo_id').notEmpty().withMessage('Valid combo ID is required'),
  body('combos.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('payment_method').notEmpty().withMessage('Payment method is required'),
  body('payment_status').optional().isIn(['paid', 'unpaid']).withMessage('Invalid payment status')
];

// Staff booking validation (includes user_id for customer)
const staffBookingValidation = [
  body('user_id').isInt().withMessage('Valid customer user ID is required'),
  ...bookingValidation
];

// User routes (requires authentication)
router.post('/', auth, bookingValidation, validate, bookingController.createBooking); //POST /api/bookings
router.get('/my-bookings', auth, bookingController.getMyBookings); //GET /api/bookings/my-bookings
router.get('/:id', auth, bookingController.getBookingById); //GET /api/bookings/:id
router.put('/:id/payment', auth, bookingController.updatePaymentStatus); //PUT /api/bookings/:id/payment
router.delete('/:id', auth, bookingController.cancelBooking); //DELETE /api/bookings/:id

// Staff routes
router.get('/', auth, isStaff, bookingController.getAllBookings); //GET /api/bookings
router.post('/staff-create', auth, isStaff, staffBookingValidation, validate, bookingController.createBookingForCustomer); //POST /api/bookings/staff-create

module.exports = router;
