const { pool } = require('../db/connection');

class Showtime {
  static async create(showtimeData) {
    const {
      theater_id, screen_number, start_time, end_time,
      date, user_id, movie_id
    } = showtimeData;

    const [result] = await pool.execute(
      `INSERT INTO showtime (theater_id, screen_number, start_time, end_time, date, user_id, movie_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [theater_id, screen_number, start_time, end_time, date, user_id, movie_id]
    );
    return { theater_id, screen_number, start_time, end_time, date };
  }

  static async findById(theater_id, screen_number, start_time, end_time, date) {
    const [rows] = await pool.execute(
      `SELECT s.*, m.title, m.duration, m.image_url as movie_image,
            t.name as theater_name, t.location, t.district,
            a.formats as auditorium_format,
            st.name as staff_name
       FROM showtime s
       JOIN movie m ON s.movie_id = m.movie_id
       JOIN theater t ON s.theater_id = t.theater_id
       JOIN auditorium a ON s.theater_id = a.theater_id AND s.screen_number = a.screen_number
       JOIN staff st ON s.user_id = st.user_id
       WHERE s.theater_id = ? AND s.screen_number = ? AND s.start_time = ? AND s.end_time = ? AND s.date = ?`,
      [theater_id, screen_number, start_time, end_time, date]
    );
    return rows[0];
  }

  static async getByMovie(movieId, filters = {}) {
    let query = `
      SELECT s.*, t.name as theater_name, t.location, t.district,
            a.formats as auditorium_format
      FROM showtime s
      JOIN theater t ON s.theater_id = t.theater_id
      JOIN auditorium a ON s.theater_id = a.theater_id AND s.screen_number = a.screen_number
      WHERE s.movie_id = ?
    `;
    const params = [movieId];

    if (filters.date) {
      query += ' AND s.date = ?';
      params.push(filters.date);
    } else {
      query += ' AND s.date >= CURDATE()';
    }

    if (filters.theater_id) {
      query += ' AND s.theater_id = ?';
      params.push(filters.theater_id);
    }

    query += ' ORDER BY s.date, s.start_time';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT s.*, m.title, m.image_url as movie_image,
            t.name as theater_name, t.location
      FROM showtime s
      JOIN movie m ON s.movie_id = m.movie_id
      JOIN theater t ON s.theater_id = t.theater_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.date) {
      query += ' AND s.date = ?';
      params.push(filters.date);
    }

    if (filters.theater_id) {
      query += ' AND s.theater_id = ?';
      params.push(filters.theater_id);
    }

    if (filters.movie_id) {
      query += ' AND s.movie_id = ?';
      params.push(filters.movie_id);
    }

    query += ' ORDER BY s.date, s.start_time';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(theater_id, screen_number, start_time, end_time, date, showtimeData) {
    const fields = [];
    const params = [];

    Object.keys(showtimeData).forEach(key => {
      if (showtimeData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(showtimeData[key]);
      }
    });

    if (fields.length === 0) return false;

    params.push(theater_id, screen_number, start_time, end_time, date);
    const query = `UPDATE showtime SET ${fields.join(', ')} 
                   WHERE theater_id = ? AND screen_number = ? AND start_time = ? AND end_time = ? AND date = ?`;

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  }

  static async delete(theater_id, screen_number, start_time, end_time, date) {
    const [result] = await pool.execute(
      `DELETE FROM showtime 
       WHERE theater_id = ? AND screen_number = ? AND start_time = ? AND end_time = ? AND date = ?`,
      [theater_id, screen_number, start_time, end_time, date]
    );
    return result.affectedRows > 0;
  }

  //count available seats for showtime
  static async getAvailableSeats(theater_id, screen_number, start_time, end_time, date) {
    //get total seats in auditorium
    const [auditorium] = await pool.execute(
      'SELECT seat_capacity FROM auditorium WHERE theater_id = ? AND screen_number = ?',
      [theater_id, screen_number]
    );

    if (!auditorium[0]) return 0;

    //get booked seats count
    const [booked] = await pool.execute(
      `SELECT COUNT(*) as booked_count
       FROM ticket
       WHERE theater_id_showtime = ? AND screen_number_showtime = ? 
       AND start_time = ? AND end_time = ? AND date = ?`,
      [theater_id, screen_number, start_time, end_time, date]
    );

    return auditorium[0].seat_capacity - booked[0].booked_count;
  }
}

module.exports = Showtime;
