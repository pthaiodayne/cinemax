const { pool } = require('../db/connection');

class Seat {
  static async getByAuditorium(theaterId, screenNumber) {
    const [rows] = await pool.execute(
      'SELECT * FROM seat WHERE theater_id = ? AND screen_number = ? ORDER BY seat_number',
      [theaterId, screenNumber]
    );
    return rows;
  }

  static async findById(theaterId, screenNumber, seatNumber) {
    const [rows] = await pool.execute(
      'SELECT * FROM seat WHERE theater_id = ? AND screen_number = ? AND seat_number = ?',
      [theaterId, screenNumber, seatNumber]
    );
    return rows[0];
  }

  static async getBookedSeats(theater_id, screen_number, start_time, end_time, date) {
    const [rows] = await pool.execute(
      `SELECT s.seat_number, s.seat_type, s.price
       FROM seat s
       WHERE s.theater_id = ? AND s.screen_number = ?
       AND s.seat_number IN (
         SELECT t.seat_number
         FROM ticket t
         WHERE t.theater_id_showtime = ? AND t.screen_number_showtime = ?
         AND t.start_time = ? AND t.end_time = ? AND t.date = ?
       )
       ORDER BY s.seat_number`,
      [theater_id, screen_number, theater_id, screen_number, start_time, end_time, date]
    );
    return rows;
  }

  static async getAvailableSeats(theater_id, screen_number, start_time, end_time, date) {
    // Use stored procedure for better performance
    const [rows] = await pool.execute(
      'CALL sp_available_seats(?, ?, ?, ?, ?)',
      [theater_id, screen_number, start_time, end_time, date]
    );
    // Stored procedure returns array of arrays, get first result set
    return rows[0];
  }

  //check specific seats availability for showtime
static async checkAvailability(
  theater_id,
  screen_number,
  seat_number,
  start_time,
  end_time,
  date
) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) as booked_count
     FROM ticket
     WHERE seat_number = ?
     AND theater_id_showtime = ?
     AND screen_number_showtime = ?
     AND start_time = ?
     AND end_time = ?
     AND date = ?`,
    [seat_number, theater_id, screen_number, start_time, end_time, date]
  );

  return rows[0].booked_count === 0;
}

}

module.exports = Seat;
