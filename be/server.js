const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./db/connection');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const seatRoutes = require('./routes/seatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const comboRoutes = require('./routes/comboRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Cinemax API Server',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`
===================================================================
                  🎬 CINEMAX API SERVER 🎬             
===================================================================                                              
Server is running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
API Base URL: http://localhost:${PORT}
Health Check: http://localhost:${PORT}/api/health

API Routes:
-----------------------Available Endpoints ------------------------
- Movies:        http://localhost:${PORT}/api/movies
- Showtimes:     http://localhost:${PORT}/api/showtimes
- Combos:        http://localhost:${PORT}/api/combos

---------------- Unauthenticated Endpoints ------------------------
- Auth:          http://localhost:${PORT}/api/auth

---------------- Authenticated Endpoints -------------------------
- Seats:         http://localhost:${PORT}/api/seats
- Bookings:      http://localhost:${PORT}/api/bookings
==================================================================                                           
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

startServer();

module.exports = app;
