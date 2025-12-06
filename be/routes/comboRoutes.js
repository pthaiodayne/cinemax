const express = require('express');
const { body } = require('express-validator');
const comboController = require('../controllers/comboController');
const { auth, isStaff } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Validation rules
const comboValidation = [
  body('combo_name').trim().notEmpty().withMessage('Combo name is required'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('image_url').optional().trim(),
  body('available').optional().isBoolean().withMessage('Available must be a boolean')
];

// Public routes
router.get('/', comboController.getAllCombos); //GET /api/combos
router.get('/:id', comboController.getComboById); //GET /api/combos/:id

// Staff routes
router.post('/', auth, isStaff, comboValidation, validate, comboController.createCombo); //POST /api/combos
router.put('/:id', auth, isStaff, comboValidation, validate, comboController.updateCombo); //PUT /api/combos/:id
router.delete('/:id', auth, isStaff, comboController.deleteCombo); //DELETE /api/combos/:id
router.patch('/:id/toggle', auth, isStaff, comboController.toggleAvailability); //PATCH /api/combos/:id/toggle

module.exports = router;
