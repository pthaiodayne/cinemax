const Review = require('../models/Review');

//create review
exports.createReview = async (req, res, next) => {
  try {
    const { movie_id, stars, review_text } = req.body;
    const user_id = req.user.userId;

    //check user already reviewed this movie
    const hasReviewed = await Review.hasUserReviewed(movie_id, user_id);
    if (hasReviewed) {
      return res.status(400).json({ error: 'You have already reviewed this movie' });
    }

    const review = await Review.create({
      movie_id,
      user_id,
      stars,
      review_text
    });

    console.log(`Review created for movie ${movie_id} by user ${user_id}`);
    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

//get reviews for a movie
exports.getMovieReviews = async (req, res, next) => {
  try {
    const reviews = await Review.getByMovie(req.params.movieId);
    const stats = await Review.getMovieStats(req.params.movieId);

    res.json({
      stats,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

//get user's reviews
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.getByUser(req.user.userId);

    res.json({
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

//update review
exports.updateReview = async (req, res, next) => {
  try {
    const { movieId, ratingId } = req.params;
    const user_id = req.user.userId;
    const { stars, review_text } = req.body;

    //check review exists and belongs to user
    const review = await Review.findById(movieId, user_id, ratingId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updated = await Review.update(movieId, user_id, ratingId, {
      stars,
      review_text
    });

    if (!updated) {
      return res.status(400).json({ error: 'No changes made' });
    }

    console.log(`Review updated: movie ${movieId}, user ${user_id}, rating ${ratingId}`);
    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    next(error);
  }
};

//delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const { movieId, ratingId } = req.params;
    const user_id = req.user.userId;

    //check review exists and belongs to user
    const review = await Review.findById(movieId, user_id, ratingId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await Review.delete(movieId, user_id, ratingId);

    console.log(`Review deleted: movie ${movieId}, user ${user_id}, rating ${ratingId}`);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
