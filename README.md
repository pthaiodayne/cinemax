## 🎨 Đóng góp Frontend

### Quy trình git

```bash
# 1. Fork repo trên GitHub

# 2. Clone và tạo branch
git clone https://github.com/pthaiodayne/cinemax
cd cinemax
git checkout -b feature/frontend

# 3. Tạo frontend project

# 4. Kết nối API backend
# base URL: http://localhost:5000/api

# 5. Code frontend...

# 6. Commit và push
cd ..
git add frontend/
git commit -m "feat: Add frontend implementation"
git push origin feature/frontend

# 7. Tạo Pull Request trên GitHub
```

### API Endpoints cho Frontend

```javascript
// Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile

// Movies
GET  /api/movies
GET  /api/movies/ongoing
GET  /api/movies/:id

POST /api/movies
PUT  /api/movies/:id
DELETE /api/movies/:id

// Showtimes
GET  /api/showtimes
GET  /api/showtimes/movie/:movieId
GET  /api/showtimes/theaters
GET  /api/showtimes/:id

POST /api/showtimes
PUT  /api/showtimes/:id
DELETE /api/showtimes/:id

// Booking
POST /api/bookings
GET  /api/bookings/my-bookings
GET  /api/bookings/:id
PUT  /api/bookings/:id/payment
DELETE /api/bookings/:id

GET  /api/bookings

// Combos
GET  /api/combos
GET  /api/combos/:id

POST /api/combos
PUT  /api/combos/:id
DELETE /api/combos/:id
PATCH /api/combos/:id

// Seats
GET  /api/seats/auditorium
GET  /api/seats/booked

// Reviews
GET  /api/reviews/movie/:movieId

POST  /api/reviews
GET   /api/reviews/my-reviews
PUT  /api/reviews/:movieId/:ratingId
DELETE /api/reviews/:movieId/:ratingId

```