const { pool } = require('../db/connection');

class Booking {
  static async create(bookingData, connection = null) {
  const conn = connection || pool;

  const {
    customer_id,     // ✅ nhận từ controller
    payment_method,
    payment_status,  // ✅ để biết paid hay unpaid
    total_cost,      // ✅ tổng tiền
    discount_amount = 0
  } = bookingData;

  // amount_paid should store the total cost, not 0 when unpaid
  const amount_paid = total_cost;

  if (
    customer_id == null ||
    !payment_method ||
    total_cost == null
  ) {
    throw new Error('Invalid booking data for Booking.create');
  }

  const [result] = await conn.execute(
    `INSERT INTO booking 
      (payment_method, discount_amount, amount_paid, date_time, user_id)
     VALUES (?, ?, ?, NOW(), ?)`,
    [payment_method, discount_amount, amount_paid, customer_id]
  );

  return result.insertId;
}

  static async findById(bookingId) {
    const [rows] = await pool.execute(
      `SELECT b.*, 
              c.name as customer_name, 
              c.email as customer_email, 
              c.phone as customer_phone
       FROM booking b
       JOIN customer c ON b.user_id = c.user_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );
    return rows[0];
  }

  //get booking with tickets and combos
  static async getBookingDetails(bookingId) {
    //get booking info
    const booking = await this.findById(bookingId);
    if (!booking) return null;

    //get tickets
    const [tickets] = await pool.execute(
      `SELECT t.*, 
              s.seat_type, s.price as seat_price,
              m.title as movie_title,
              th.name as theater_name
       FROM ticket t
       JOIN seat s ON t.theater_id_seat = s.theater_id 
                  AND t.screen_number_seat = s.screen_number 
                  AND t.seat_number = s.seat_number
       JOIN showtime st ON t.theater_id_showtime = st.theater_id 
                       AND t.screen_number_showtime = st.screen_number
                       AND t.start_time = st.start_time 
                       AND t.end_time = st.end_time
                       AND t.date = st.date
       JOIN movie m ON st.movie_id = m.movie_id
       JOIN theater th ON t.theater_id_showtime = th.theater_id
       WHERE t.booking_id = ?`,
      [bookingId]
    );

    //get combos
    const [combos] = await pool.execute(
      `SELECT c.combo_id, c.name, c.price, bc.count, c.image_url
       FROM bookingcombo bc
       JOIN combo c ON bc.combo_id = c.combo_id
       WHERE bc.booking_id = ?`,
      [bookingId]
    );

    return {
      ...booking,
      tickets,
      combos
    };
  }

  static async addCombos(bookingId, combos, connection = null) {
    const conn = connection || pool;

    if (!bookingId || !Array.isArray(combos) || combos.length === 0) {
      return;
    }

    // Lọc combos hợp lệ
    const validCombos = combos.filter(
      (c) => c && c.combo_id && Number(c.quantity) > 0
    );

    if (validCombos.length === 0) return;

    // Tạo VALUES (?, ?, ?) nhiều dòng
    const values = [];
    const params = [];

    validCombos.forEach((c) => {
      values.push('(?, ?, ?)');
      params.push(bookingId, c.combo_id, Number(c.quantity)); // map -> count
    });

    const sql = `
      INSERT INTO bookingcombo (booking_id, combo_id, count)
      VALUES ${values.join(',')}
    `;

    await conn.execute(sql, params);
  }

  //get bookings by user - for user profile page
  static async getByUser(userId, filters = {}) {
    let query = `
      SELECT b.booking_id,
             b.payment_method,
             b.discount_amount,
             b.amount_paid,
             b.date_time,
             b.scan_at,
             b.user_id,
             COUNT(DISTINCT t.ticket_id) as ticket_count
      FROM booking b
      LEFT JOIN ticket t ON b.booking_id = t.booking_id
      WHERE b.user_id = ?
      GROUP BY b.booking_id, b.payment_method, b.discount_amount, b.amount_paid, b.date_time, b.scan_at, b.user_id
      ORDER BY b.date_time DESC
    `;
    const params = [userId];

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  //get all bookings - for admin page
  static async getAll(filters = {}) {
    let query = `
      SELECT b.booking_id,
             b.payment_method,
             b.discount_amount,
             b.amount_paid,
             b.date_time,
             b.scan_at,
             b.user_id,
             c.name as customer_name, 
             c.email as customer_email,
             COUNT(DISTINCT t.ticket_id) as ticket_count
      FROM booking b
      JOIN customer c ON b.user_id = c.user_id
      LEFT JOIN ticket t ON b.booking_id = t.booking_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.date) {
      query += ' AND DATE(b.date_time) = ?';
      params.push(filters.date);
    }

    query += ' GROUP BY b.booking_id, b.payment_method, b.discount_amount, b.amount_paid, b.date_time, b.scan_at, b.user_id, c.name, c.email';
    query += ' ORDER BY b.date_time DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async updateScanTime(bookingId) {
    const [result] = await pool.execute(
      'UPDATE booking SET scan_at = NOW() WHERE booking_id = ?',
      [bookingId]
    );
    return result.affectedRows > 0;
  }

  static async updatePaymentStatus(bookingId, paymentStatus) {
    // payment_status is just a virtual field - we don't store it
    // We can use scan_at or another field to track payment
    // For now, just return true as the booking already has amount_paid set
    return true;
  }

  static async delete(bookingId) {
    const [result] = await pool.execute(
      'DELETE FROM booking WHERE booking_id = ?',
      [bookingId]
    );
    return result.affectedRows > 0;
  }
}

class Ticket {
  static async create(ticketData, connection = null) {
    const conn = connection || pool;
    const {
      price_paid, theater_id_seat, screen_number_seat, seat_number,
      theater_id_showtime, screen_number_showtime, start_time, end_time,
      date, booking_id
    } = ticketData;

    const [result] = await conn.execute(
      `INSERT INTO ticket (purchase_at, price_paid, theater_id_seat, screen_number_seat, seat_number,
                           theater_id_showtime, screen_number_showtime, start_time, end_time, date, booking_id)
       VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [price_paid, theater_id_seat, screen_number_seat, seat_number,
       theater_id_showtime, screen_number_showtime, start_time, end_time, date, booking_id]
    );
    return result.insertId;
  }

  //get ticket by ticket id
  static async findById(ticketId) {
    const [rows] = await pool.execute(
      'SELECT * FROM ticket WHERE ticket_id = ?',
      [ticketId]
    );
    return rows[0];
  }

  //get tickets by booking id
  static async getByBooking(bookingId) {
    const [rows] = await pool.execute(
      `SELECT t.*, s.seat_type, s.price as seat_base_price
      FROM ticket t
      JOIN seat s ON t.theater_id_seat = s.theater_id 
                AND t.screen_number_seat = s.screen_number
                AND t.seat_number = s.seat_number
      WHERE t.booking_id = ?`,
      [bookingId]
    );
    return rows;
  }
  
}

module.exports = { Booking, Ticket };
