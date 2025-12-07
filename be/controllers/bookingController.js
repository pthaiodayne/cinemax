const { Booking, Ticket } = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const Combo = require('../models/Combo');
const { pool } = require('../db/connection');

//all bookings for current user
exports.getMyBookings = async (req, res, next) => {
  try {
    if (req.user.userType !== 'customer') {
      console.log('Access denied: User is not a customer');
      return res.status(403).json({ error: 'Only customers can view their bookings' });
    }

    const bookings = await Booking.getByUser(req.user.userId);
    console.log(`Retrieved ${bookings.length} bookings for customer ID ${req.user.userId}`);

    res.json({
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

//get booking by ID
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.getBookingDetails(req.params.id);

    if (!booking) {
      console.log(`Booking with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Booking not found' });
    }

    //check: user owns this booking or is staff
    if (req.user.userType === 'customer' && booking.user_id !== req.user.userId) {
      console.log(`Access denied: Customer ID ${req.user.userId} tried to access booking ID ${req.params.id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log(`Booking with ID ${req.params.id} retrieved by user ID ${req.user.userId}`);
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

//create booking
exports.createBooking = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    if (req.user.userType !== 'customer') {
      await connection.rollback();
      console.log('Access denied: User is not a customer');
      return res.status(403).json({ error: 'Only customers can create bookings' });
    }

    const { 
      showtime: { theater_id, screen_number, start_time, end_time, date },
      seats,
      combos,
      payment_method,
      payment_status = 'unpaid'
    } = req.body;

    console.log('Creating booking with showtime:', { theater_id, screen_number, start_time, end_time, date });

    //validate showtime
    const showtime = await Showtime.findById(theater_id, screen_number, start_time, end_time, date);
    console.log('Showtime found:', showtime);
    if (!showtime) {
      await connection.rollback();
      console.log('Showtime not found for booking creation');
      return res.status(404).json({ error: 'Showtime not found' });
    }

    //check: seat availability
    if (!seats || seats.length === 0) {
      await connection.rollback();
      console.log('No seats selected for booking creation');
      return res.status(400).json({ error: 'At least one seat must be selected' });
    }

    //seat availability for this showtime
    for (const seatInfo of seats) {
      const available = await Seat.checkAvailability(
        theater_id,
        screen_number,
        seatInfo.seat_number,
        theater_id,
        screen_number,
        start_time,
        end_time,
        date
      );
      
      if (!available) {
        await connection.rollback();
        console.log(`Seat ${seatInfo.seat_number} is not available for booking creation`);
        return res.status(400).json({ 
          error: `Seat ${seatInfo.seat_number} is not available` 
        });
      }
    }

    //calculate total amount
    let totalAmount = 0;

    //seats cost - use seat.price directly from database
    for (const seatInfo of seats) {
      const seat = await Seat.findById(theater_id, screen_number, seatInfo.seat_number);
      if (!seat) {
        await connection.rollback();
        console.log(`Seat ${seatInfo.seat_number} not found for booking creation`);
        return res.status(400).json({ error: `Seat ${seatInfo.seat_number} not found` });
      }
      totalAmount += parseFloat(seat.price);
    }

    //combos cost
    if (combos && combos.length > 0) {
      for (const comboInfo of combos) {
        const combo = await Combo.findById(comboInfo.combo_id);
        console.log('Combo info:', comboInfo, 'Combo details:', combo);
        if (!combo) {
          await connection.rollback();
          console.log(`Combo ${comboInfo.combo_id} not found for booking creation`);
          return res.status(400).json({ error: `Combo ${comboInfo.combo_id} not found` });
        }
        totalAmount += parseFloat(combo.price) * comboInfo.quantity;
      }
    }

    //create booking
    const bookingId = await Booking.create({
      customer_id: req.user.userId,
      payment_method,
      payment_status,
      total_cost: totalAmount
    }, connection);

    //create tickets for each seat
    for (const seatInfo of seats) {
      const seat = await Seat.findById(theater_id, screen_number, seatInfo.seat_number);
      
      await Ticket.create({
        booking_id: bookingId,

        // ✅ ĐÚNG theo Ticket.create
        price_paid: seat.price,

        theater_id_seat: theater_id,
        screen_number_seat: screen_number,
        seat_number: seatInfo.seat_number,

        theater_id_showtime: theater_id,
        screen_number_showtime: screen_number,
        start_time: start_time,
        end_time: end_time,
        date: date
      }, connection);
    }

    //add combos to booking
    if (combos && combos.length > 0) {
      await Booking.addCombos(bookingId, combos, connection);
    }

    await connection.commit();

    //get complete booking details
    const booking = await Booking.getBookingDetails(bookingId);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { payment_status } = req.body;
    
    if (!['paid', 'unpaid', 'refunded'].includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    //check: user owns this booking or is staff
    if (req.user.userType === 'customer' && booking.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await Booking.updatePaymentStatus(req.params.id, payment_status);

    if (!updated) {
      console.log(`Failed to update payment status for booking ${req.params.id}`);
      return res.status(400).json({ error: 'Failed to update payment status' });
    }

    const updatedBooking = await Booking.getBookingDetails(req.params.id);
    console.log('Updated booking details:', updatedBooking);

    res.json({
      message: 'Payment status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    console.log('Booking to cancel:', booking);

    if (!booking) {
      console.log('Booking not found for cancellation:', req.params.id);
      return res.status(404).json({ error: 'Booking not found' });
    }

    //check: user owns this booking or is staff
    if (req.user.userType === 'customer' && booking.customer_id !== req.user.userId) {
      console.log(`Access denied for user ${req.user.userId} to cancel booking ${req.params.id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    await Booking.delete(req.params.id);
    console.log(`Booking ${req.params.id} cancelled successfully`);

    res.json({
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings (Staff only)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, date } = req.query;

    const bookings = await Booking.getAll({ status, date });
    console.log('Staff retrieved all bookings:', bookings.length);

    res.json({
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};
