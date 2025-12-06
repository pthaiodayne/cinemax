const { pool } = require('../db/connection');

class Review {
  static async create(reviewData) {
    const { movie_id, user_id, stars, review_text } = reviewData;
    
    // Get next rating_id for this movie/user combination
    const [existing] = await pool.execute(
      'SELECT COALESCE(MAX(rating_id), 0) + 1 as next_id FROM review WHERE movie_id = ? AND user_id = ?',
      [movie_id, user_id]
    );
    const rating_id = existing[0].next_id;

    const [result] = await pool.execute(
      `INSERT INTO review (movie_id, user_id, rating_id, stars, review_text, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [movie_id, user_id, rating_id, stars, review_text]
    );
    
    return { movie_id, user_id, rating_id };
  }

  static async findById(movieId, userId, ratingId) {
    const [rows] = await pool.execute(
      `SELECT r.*, c.name as customer_name
       FROM review r
       JOIN customer c ON r.user_id = c.user_id
       WHERE r.movie_id = ? AND r.user_id = ? AND r.rating_id = ?`,
      [movieId, userId, ratingId]
    );
    return rows[0];
  }

  static async getByMovie(movieId) {
    const [rows] = await pool.execute(
      `SELECT r.*, c.name as customer_name, c.email as customer_email
       FROM review r
       JOIN customer c ON r.user_id = c.user_id
       WHERE r.movie_id = ?
       ORDER BY r.created_at DESC`,
      [movieId]
    );
    return rows;
  }

  static async getByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT r.*, m.title as movie_title, m.image_url as movie_image
       FROM review r
       JOIN movie m ON r.movie_id = m.movie_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async getMovieStats(movieId) {
    const [rows] = await pool.execute(
      `SELECT 
            COUNT(*) as total_reviews,
            AVG(stars) as average_rating,
            SUM(CASE WHEN stars = 5 THEN 1 ELSE 0 END) as five_stars,
            SUM(CASE WHEN stars = 4 THEN 1 ELSE 0 END) as four_stars,
            SUM(CASE WHEN stars = 3 THEN 1 ELSE 0 END) as three_stars,
            SUM(CASE WHEN stars = 2 THEN 1 ELSE 0 END) as two_stars,
            SUM(CASE WHEN stars = 1 THEN 1 ELSE 0 END) as one_star
       FROM review
       WHERE movie_id = ?`,
      [movieId]
    );
    return rows[0];
  }

  

  static async update(movieId, userId, ratingId, updateData) {
    const fields = [];
    const params = [];

    if (updateData.stars !== undefined) {
      fields.push('stars = ?');
      params.push(updateData.stars);
    }
    if (updateData.review_text !== undefined) {
      fields.push('review_text = ?');
      params.push(updateData.review_text);
    }

    if (fields.length === 0) return false;

    params.push(movieId, userId, ratingId);
    const query = `UPDATE review SET ${fields.join(', ')} WHERE movie_id = ? AND user_id = ? AND rating_id = ?`;

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  static async delete(movieId, userId, ratingId) {
    const [result] = await pool.execute(
      'DELETE FROM review WHERE movie_id = ? AND user_id = ? AND rating_id = ?',
      [movieId, userId, ratingId]
    );
    return result.affectedRows > 0;
  }

  //already reviewed this movie
  static async hasUserReviewed(movieId, userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM review WHERE movie_id = ? AND user_id = ?',
      [movieId, userId]
    );
    return rows[0].count > 0;
  }
}

module.exports = Review;
