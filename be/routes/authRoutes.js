const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').isMobilePhone('vi-VN').withMessage('Valid phone number required'),
  body('dob').isISO8601().withMessage('Valid date of birth required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Valid phone number required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other')
];

// Routes
router.post('/register', registerValidation, validate, authController.register); //LINK: /api/auth/register
router.post('/login', loginValidation, validate, authController.login); //LINK: /api/auth/login
router.get('/profile', auth, authController.getProfile); //LINK: /api/auth/profile
router.put('/profile', auth, updateProfileValidation, validate, authController.updateProfile); //LINK: /api/auth/profile

module.exports = router;
