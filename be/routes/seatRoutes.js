const express = require('express');
const seatController = require('../controllers/seatController');

const router = express.Router();

// Public routes
// GET /api/seats/auditorium?theater_id=1&screen_number=1
router.get('/auditorium', seatController.getSeatsByAuditorium); //GET /api/seats/auditorium

// GET /api/seats/booked?theater_id=1&screen_number=1&start_time=14:00:00&end_time=16:30:00&date=2024-03-20
router.get('/booked', seatController.getBookedSeats); //GET /api/seats/booked

module.exports = router;
