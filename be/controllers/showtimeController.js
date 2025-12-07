const Showtime = require('../models/Showtime');
const { Theater, Auditorium } = require('../models/Theater');
const { pool } = require('../db/connection');

//get all showtimes
exports.getAllShowtimes = async (req, res, next) => {
  try {
    const { date, theater_id, movie_id } = req.query;

    const showtimes = await Showtime.getAll({ date, theater_id, movie_id });

    console.log(`Retrieved ${showtimes.length} showtimes with filters - Date: ${date}, Theater ID: ${theater_id}, Movie ID: ${movie_id}`);

    res.json({
      count: showtimes.length,
      showtimes
    });
  } catch (error) {
    next(error);
  }
};

// ✅ get all screens for a theater
exports.getScreensByTheater = async (req, res, next) => {
  try {
    const { theater_id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT screen_number, formats
      FROM auditorium
      WHERE theater_id = ?
      ORDER BY screen_number
      `,
      [theater_id]
    );

    res.json({
      count: rows.length,
      screens: rows,
    });
  } catch (err) {
    next(err);
  }
};


//get showtimes by movie
exports.getShowtimesByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { date, theater_id } = req.query;

    const showtimes = await Showtime.getByMovie(movieId, { date, theater_id });

    console.log(`Retrieved ${showtimes.length} showtimes for movie ID ${movieId} with filters - Date: ${date}, Theater ID: ${theater_id}`);
    res.json({
      count: showtimes.length,
      showtimes
    });
  } catch (error) {
    next(error);
  }
};

//get showtime by composite key
exports.getShowtimeById = async (req, res, next) => {
  try {
    const { theater_id, screen_number, start_time, end_time, date } = req.query;

    if (!theater_id || !screen_number || !start_time || !end_time || !date) {
      console.log('Missing required composite key fields');
      return res.status(400).json({ error: 'Missing required composite key fields' });
    }

    const showtime = await Showtime.findById(theater_id, screen_number, start_time, end_time, date);

    if (!showtime) {
      console.log(`Showtime not found for composite key - Theater ID: ${theater_id}, Screen Number: ${screen_number}, Start Time: ${start_time}, End Time: ${end_time}, Date: ${date}`);
      return res.status(404).json({ error: 'Showtime not found' });
    }

    console.log(`Showtime retrieved for composite key - Theater ID: ${theater_id}, Screen Number: ${screen_number}, Start Time: ${start_time}, End Time: ${end_time}, Date: ${date}`);
    res.json({ showtime });
  } catch (error) {
    next(error);
  }
};

//create showtime (Staff only)
exports.createShowtime = async (req, res, next) => {
  try {
    const { movie_id, theater_id, screen_number, start_time, end_time, date } = req.body;

    //verify auditorium exists
    const auditorium = await Auditorium.findById(theater_id, screen_number);
    if (!auditorium) {
      console.log(`Auditorium not found - Theater ID: ${theater_id}, Screen Number: ${screen_number}`);
      return res.status(404).json({ error: 'Auditorium not found' });
    }

    const showtimeKey = await Showtime.create({
      movie_id,
      theater_id,
      screen_number,
      start_time,
      date,
      user_id: req.user.userId   // ✅ BẮT BUỘC PHẢI CÓ
    });

    const showtime = await Showtime.findById(
      showtimeKey.theater_id,
      showtimeKey.screen_number,
      showtimeKey.start_time,
      showtimeKey.end_time,
      showtimeKey.date
    );

    console.log(`Showtime created successfully - Theater ID: ${theater_id}, Screen Number: ${screen_number}, Start Time: ${start_time}, End Time: ${end_time}, Date: ${date}`);

    res.status(201).json({
      message: 'Showtime created successfully',
      showtime
    });
  } catch (error) {
    next(error);
  }
};

//update showtime (Staff only)
exports.updateShowtime = async (req, res, next) => {
  try {
    const { theater_id, screen_number, start_time, end_time, date } = req.query;
    
    if (!theater_id || !screen_number || !start_time || !end_time || !date) {
      console.log('Missing required composite key fields');
      return res.status(400).json({ error: 'Missing required composite key fields' });
    }

    const showtimeData = req.body;

    const updated = await Showtime.update(
      theater_id,
      screen_number,
      start_time,
      end_time,
      date,
      showtimeData
    );

    if (!updated) {
      console.log(`Showtime not found for composite key - Theater ID: ${theater_id}, Screen Number: ${screen_number}, Start Time: ${start_time}, End Time: ${end_time}, Date: ${date}`);
      return res.status(404).json({ error: 'Showtime not found' });
    }

    const showtime = await Showtime.findById(theater_id, screen_number, start_time, end_time, date);

    console.log(`Showtime updated successfully - Theater ID: ${theater_id}, Screen Number: ${screen_number}, Start Time: ${start_time}, End Time: ${end_time}, Date: ${date}`);

    res.json({
      message: 'Showtime updated successfully',
      showtime
    });
  } catch (error) {
    next(error);
  }
};

//delete showtime (Staff only)
exports.deleteShowtime = async (req, res, next) => {
  try {
    const { theater_id, screen_number, start_time, end_time, date } = req.query;
    
    if (!theater_id || !screen_number || !start_time || !end_time || !date) {
      console.log('Missing required composite key fields');
      return res.status(400).json({ error: 'Missing required composite key fields' });
    }

    const deleted = await Showtime.delete(theater_id, screen_number, start_time, end_time, date);

    if (!deleted) {
      console.log(`Showtime not found for composite key - Theater ID: ${theater_id}, Screen Number: ${screen_number}, Start Time: ${start_time}, End Time: ${end_time}, Date: ${date}`);
      return res.status(404).json({ error: 'Showtime not found' });
    }

    console.log(`Showtime deleted successfully - Theater ID: ${theater_id}, Screen Number: ${screen_number}, Start Time: ${start_time}, End Time: ${end_time}, Date: ${date}`);

    res.json({
      message: 'Showtime deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

//get all theaters
exports.getAllTheaters = async (req, res, next) => {
  try {
    const theaters = await Theater.getAll();
    console.log(`Retrieved ${theaters.length} theaters`);
    
    res.json({
      count: theaters.length,
      theaters
    });
  } catch (error) {
    next(error);
  }
};
