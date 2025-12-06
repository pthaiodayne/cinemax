const express = require('express');
const { body } = require('express-validator');
const movieController = require('../controllers/movieController');
const { auth, isStaff } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Validation rules
const movieValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('duration').isInt({ min: 1 }).withMessage('Valid duration is required'),
  body('release_date').optional().isISO8601().withMessage('Valid date is required'),
  body('genre').optional().trim(),
  body('language').optional().trim(),
  body('rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),
  body('status').optional().isIn(['coming_soon', 'now_showing', 'ended']).withMessage('Invalid status')
];

// Public routes
router.get('/', movieController.getAllMovies); //GET /api/movies
router.get('/ongoing', movieController.getOngoing); //GET /api/movies/ongoing
router.get('/:id', movieController.getMovieById); //GET /api/movies/:id

// Staff routes
router.post('/', auth, isStaff, movieValidation, validate, movieController.createMovie); //POST /api/movies
router.put('/:id', auth, isStaff, movieValidation, validate, movieController.updateMovie); //PUT /api/movies/:id
router.delete('/:id', auth, isStaff, movieController.deleteMovie); //DELETE /api/movies/:id

module.exports = router;
