const { pool } = require('../db/connection');

class Movie {
  static async create(movieData) {
    const {
      title, duration, release_date, plot_description,
      age_restrict, production_company, user_id, status, image_url
    } = movieData;
    
    const [result] = await pool.execute(
      `INSERT INTO movie (title, duration, release_date, plot_description, 
       age_restrict, production_company, user_id, status, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, duration, release_date, plot_description, 
       age_restrict, production_company, user_id, status || 'ongoing', image_url]
    );
    return result.insertId;
  }

  static async findById(movieId) {
    const [rows] = await pool.execute(
      `SELECT m.*, s.name as created_by_name,
              COALESCE(AVG(r.stars), 0) as rating,
              COUNT(r.rating_id) as review_count
       FROM movie m
       LEFT JOIN staff s ON m.user_id = s.user_id
       LEFT JOIN review r ON m.movie_id = r.movie_id
       WHERE m.movie_id = ?
       GROUP BY m.movie_id`,
      [movieId]
    );
    
    //get genres, formats, crew
    if (rows[0]) {
      //get genres
      const [genres] = await pool.execute(
        'SELECT genre_type FROM genre WHERE movie_id = ?',
        [movieId]
      );
      rows[0].genres = genres.map(g => g.genre_type);

      //get formats
      const [formats] = await pool.execute(
        'SELECT format_type FROM format WHERE movie_id = ?',
        [movieId]
      );
      rows[0].formats = formats.map(f => f.format_type);

      //get crew
      const [crew] = await pool.execute(
        `SELECT c.person_id, c.person_name, c.image_url, p.role
         FROM participate p
         JOIN crew c ON p.person_id = c.person_id
         WHERE p.movie_id = ?`,
        [movieId]
      );
      rows[0].crew = crew;
    }
    
    return rows[0];
  }
  

  static async getAll(filters = {}) {
    let query = `
      SELECT m.*, s.name as created_by_name,
             COALESCE(AVG(r.stars), 0) as rating,
             COUNT(r.rating_id) as review_count
      FROM movie m
      LEFT JOIN staff s ON m.user_id = s.user_id
      LEFT JOIN review r ON m.movie_id = r.movie_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND m.status = ?';
      params.push(filters.status);
    }

    if (filters.genre) {
      query += ` AND m.movie_id IN (
        SELECT movie_id FROM genre WHERE genre_type = ?
      )`;
      params.push(filters.genre);
    }

    if (filters.search) {
      query += ' AND (m.title LIKE ? OR m.plot_description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' GROUP BY m.movie_id ORDER BY m.release_date DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(movieId, movieData) {
    const fields = [];
    const params = [];

    Object.keys(movieData).forEach(key => {
      if (movieData[key] !== undefined && key !== 'movie_id') {
        fields.push(`${key} = ?`);
        params.push(movieData[key]);
      }
    });

    if (fields.length === 0) return false;

    params.push(movieId);
    const query = `UPDATE movie SET ${fields.join(', ')} WHERE movie_id = ?`;

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  static async delete(movieId) {
    const [result] = await pool.execute(
      'DELETE FROM movie WHERE movie_id = ?',
      [movieId]
    );
    return result.affectedRows > 0;
  }

  static async addGenre(movieId, genreType) {
    await pool.execute(
      'INSERT IGNORE INTO genre (movie_id, genre_type) VALUES (?, ?)',
      [movieId, genreType]
    );
  }

  static async addFormat(movieId, formatType) {
    await pool.execute(
      'INSERT IGNORE INTO format (movie_id, format_type) VALUES (?, ?)',
      [movieId, formatType]
    );
  }

  static async getOngoing() {
    const [rows] = await pool.execute(
      'SELECT * FROM movie WHERE status = ? ORDER BY release_date DESC',
      ['ongoing']
    );
    return rows;
  }
}

module.exports = Movie;
