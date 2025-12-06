const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

//validation rules
const reviewValidation = [
  body('movie_id').isInt({ min: 1 }).withMessage('Valid movie ID is required'),
  body('stars').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review_text').optional().trim()
];

const updateReviewValidation = [
  body('stars').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review_text').optional().trim()
];

//public routes
router.get('/movie/:movieId', reviewController.getMovieReviews); // GET /api/reviews/movie/:movieId

//customer routes
router.post('/', auth, reviewValidation, validate, reviewController.createReview); // POST /api/reviews
router.get('/my-reviews', auth, reviewController.getMyReviews); // GET /api/reviews/my-reviews
router.put('/:movieId/:ratingId', auth, updateReviewValidation, validate, reviewController.updateReview); // PUT /api/reviews/:movieId/:ratingId
router.delete('/:movieId/:ratingId', auth, reviewController.deleteReview); // DELETE /api/reviews/:movieId/:ratingId

module.exports = router;
