'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Customer {
  user_id: number;
  name: string;
  email: string;
  phone: string;
}

interface Movie {
  movie_id: number;
  title: string;
  image_url?: string;
  duration: number;
}

interface Theater {
  theater_id: number;
  name: string;
  location?: string;
  district?: string;
}

interface Showtime {
  theater_id: number;
  screen_number: number;
  start_time: string;
  end_time: string;
  date: string;
  movie_id: number;
  title: string;
  theater_name: string;
  format?: string;
  auditorium_format?: string;
}

interface Seat {
  seat_number: string;
  seat_type: string;
}

interface Combo {
  combo_id: string;
  name: string;
  price: number;
  image_url?: string;
}

type BookingStep = 'customer' | 'movie' | 'showtime' | 'seats' | 'combos' | 'confirm';

const CreateBookingPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<BookingStep>('customer');
  
  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  
  // Selection states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTheaterId, setSelectedTheaterId] = useState<number | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<{ combo_id: string; quantity: number; price: number }[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchMovie, setSearchMovie] = useState('');
  const [userName, setUserName] = useState('Staff');
  const [userRole, setUserRole] = useState('staff');

  // Load user info from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'Staff');
        setUserRole(user.role || 'staff');
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    }
  };

  // Fetch movies when movie step is reached
  useEffect(() => {
    if (currentStep === 'movie' && movies.length === 0) {
      fetchMovies();
    }
  }, [currentStep]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/movies?status=ongoing`);
      if (!res.ok) throw new Error('Failed to fetch movies');
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (err: any) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  // Fetch showtimes when movie is selected (fetch all showtimes for the movie)
  useEffect(() => {
    if (selectedMovie && currentStep === 'showtime') {
      fetchShowtimes();
    }
  }, [selectedMovie, selectedTheaterId, currentStep]);

  const fetchShowtimes = async () => {
    if (!selectedMovie) return;
    
    try {
      setLoading(true);
      // Fetch ALL showtimes for this movie (no date filter for demo)
      let url = `${API_BASE}/showtimes?movie_id=${selectedMovie.movie_id}`;
      if (selectedTheaterId) {
        url += `&theater_id=${selectedTheaterId}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch showtimes');
      const data = await res.json();
      const allShowtimes = data.showtimes || [];
      
      // Group by date and set the first available date
      if (allShowtimes.length > 0 && !selectedDate) {
        const firstDate = allShowtimes[0].date;
        setSelectedDate(typeof firstDate === 'string' ? firstDate.split('T')[0] : firstDate);
      }
      
      setShowtimes(allShowtimes);
      
      // Extract unique theaters
      const uniqueTheaters = Array.from(
        new Map(
          allShowtimes.map((st: Showtime) => [
            st.theater_id,
            { theater_id: st.theater_id, name: st.theater_name }
          ])
        ).values()
      );
      setTheaters(uniqueTheaters as Theater[]);
    } catch (err: any) {
      console.error('Error fetching showtimes:', err);
      setError('Failed to load showtimes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch seats when showtime is selected
  useEffect(() => {
    if (selectedShowtime && currentStep === 'seats') {
      fetchSeats();
    }
  }, [selectedShowtime, currentStep]);

  const fetchSeats = async () => {
    if (!selectedShowtime) return;
    
    try {
      setLoading(true);
      
      // Fetch all seats in auditorium
      const seatsRes = await fetch(
        `${API_BASE}/seats/auditorium?theater_id=${selectedShowtime.theater_id}&screen_number=${selectedShowtime.screen_number}`
      );
      if (!seatsRes.ok) throw new Error('Failed to fetch seats');
      const seatsData = await seatsRes.json();
      setSeats(seatsData.seats || []);
      
      // Fetch booked seats for this showtime
      const bookedRes = await fetch(
        `${API_BASE}/seats/booked?theater_id=${selectedShowtime.theater_id}&screen_number=${selectedShowtime.screen_number}&start_time=${selectedShowtime.start_time}&end_time=${selectedShowtime.end_time}&date=${selectedShowtime.date}`
      );
      if (!bookedRes.ok) throw new Error('Failed to fetch booked seats');
      const bookedData = await bookedRes.json();
      setBookedSeats((bookedData.bookedSeats || []).map((s: any) => s.seat_number));
    } catch (err: any) {
      console.error('Error fetching seats:', err);
      setError('Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  // Fetch combos when combo step is reached
  useEffect(() => {
    if (currentStep === 'combos' && combos.length === 0) {
      fetchCombos();
    }
  }, [currentStep]);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/combos`);
      if (!res.ok) throw new Error('Failed to fetch combos');
      const data = await res.json();
      setCombos(data.combos || []);
    } catch (err: any) {
      console.error('Error fetching combos:', err);
      setError('Failed to load combos');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatSelection = (seatNumber: string) => {
    if (bookedSeats.includes(seatNumber)) return;
    
    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const getSeatColor = (seatNumber: string) => {
    if (bookedSeats.includes(seatNumber)) return 'bg-gray-900 cursor-not-allowed';
    if (selectedSeats.includes(seatNumber)) return 'bg-red-600';
    
    const seat = seats.find(s => s.seat_number === seatNumber);
    if (seat?.seat_type === 'vip') return 'bg-yellow-500 text-black';
    
    return 'bg-gray-700 hover:bg-gray-600';
  };

  const updateComboQuantity = (comboId: string, quantity: number, price: number) => {
    setSelectedCombos(prev => {
      const existing = prev.find(c => c.combo_id === comboId);
      if (quantity === 0) {
        return prev.filter(c => c.combo_id !== comboId);
      }
      if (existing) {
        return prev.map(c => c.combo_id === comboId ? { ...c, quantity } : c);
      }
      return [...prev, { combo_id: comboId, quantity, price }];
    });
  };

  const handleSubmitBooking = async () => {
    if (!selectedCustomer || !selectedShowtime || selectedSeats.length === 0) {
      alert('Please complete all required selections');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        user_id: selectedCustomer.user_id, // Staff specifies which customer
        showtime: {
          theater_id: selectedShowtime.theater_id,
          screen_number: selectedShowtime.screen_number,
          start_time: selectedShowtime.start_time,
          end_time: selectedShowtime.end_time,
          date: selectedShowtime.date,
        },
        seats: selectedSeats.map(seat => ({ seat_number: seat })),
        combos: selectedCombos.map(c => ({ combo_id: c.combo_id, quantity: c.quantity })),
        payment_method: 'cash',
        payment_status: 'unpaid'
      };

      const res = await fetch(`${API_BASE}/bookings/staff-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const data = await res.json();
      alert('Booking created successfully!');
      router.push(`/ticket/${data.booking.booking_id}`);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      alert(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const seatPrice = 100000; // Default price per seat
  const ticketTotal = selectedSeats.length * seatPrice;
  const comboTotal = selectedCombos.reduce((sum, c) => sum + (c.price * c.quantity), 0);
  const grandTotal = ticketTotal + comboTotal;

  // Filter functions
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.email.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.phone.includes(searchCustomer)
  );

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchMovie.toLowerCase())
  );

  // Organize seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.seat_number.charAt(0);
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Get unique dates from showtimes (for demo: show all dates that have showtimes)
  const getAvailableDates = () => {
    const uniqueDates = Array.from(
      new Set(
        showtimes.map(st => {
          const dateStr = st.date;
          if (typeof dateStr === 'string') {
            return dateStr.split('T')[0];
          }
          return dateStr;
        })
      )
    ).sort();
    
    return uniqueDates;
  };

  // Filter showtimes by selected date
  const filteredShowtimes = selectedDate 
    ? showtimes.filter(st => {
        const stDate = typeof st.date === 'string' ? st.date.split('T')[0] : st.date;
        return stDate === selectedDate;
      })
    : showtimes;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0b0b0b] border-r border-[#242424] flex flex-col">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#242424]">
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-red-600 text-sm font-semibold">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold leading-none">{userName}</div>
            <div className="text-xs text-gray-400 mt-1 capitalize">{userRole}</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/staff/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">⌂</span>
            <span>Dashboard</span>
          </Link>

          <Link href="/staff/bookings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🎟️</span>
            <span>Bookings</span>
          </Link>

          <Link href="/staff/customers" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">👥</span>
            <span>Customers</span>
          </Link>

          <Link href="/staff/movies" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🎬</span>
            <span>Movies</span>
          </Link>

          <Link href="/staff/showtimes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🕐</span>
            <span>Showtimes</span>
          </Link>

          <Link href="/staff/combos" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🍿</span>
            <span>Combos</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 px-8 py-6 bg-[#050505]">
        <h1 className="text-3xl font-semibold mb-2">Create Booking for Customer</h1>
        <p className="text-gray-400 mb-6">Book tickets on behalf of existing customers</p>

        {error && (
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {(['customer', 'movie', 'showtime', 'seats', 'combos', 'confirm'] as BookingStep[]).map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                currentStep === step ? 'bg-red-600' : 
                idx < ['customer', 'movie', 'showtime', 'seats', 'combos', 'confirm'].indexOf(currentStep) ? 'bg-green-900' : 'bg-gray-800'
              }`}>
                {step === 'customer' && '1. Select Customer'}
                {step === 'movie' && '2. Select Movie'}
                {step === 'showtime' && '3. Select Showtime'}
                {step === 'seats' && '4. Select Seats'}
                {step === 'combos' && '5. Add Combos (Optional)'}
                {step === 'confirm' && '6. Confirm'}
              </div>
              {idx < 5 && <div className="w-8 h-0.5 bg-gray-700 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Customer */}
        {currentStep === 'customer' && (
          <div className="bg-[#0b0b0b] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Select Customer</h2>
            
            <input
              type="text"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full py-2 px-4 bg-gray-800 rounded-lg mb-4 text-white"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.user_id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setCurrentStep('movie');
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCustomer?.user_id === customer.user_id
                      ? 'border-red-600 bg-red-900/20'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-400">{customer.email}</p>
                  <p className="text-sm text-gray-400">{customer.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Movie */}
        {currentStep === 'movie' && (
          <div className="bg-[#0b0b0b] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Select Movie</h2>
              <button onClick={() => setCurrentStep('customer')} className="text-gray-400 hover:text-white">
                ← Back
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-400">Selected Customer:</p>
              <p className="font-medium">{selectedCustomer?.name}</p>
            </div>

            <input
              type="text"
              value={searchMovie}
              onChange={(e) => setSearchMovie(e.target.value)}
              placeholder="Search movies..."
              className="w-full py-2 px-4 bg-gray-800 rounded-lg mb-4 text-white"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.movie_id}
                  onClick={() => {
                    setSelectedMovie(movie);
                    setCurrentStep('showtime');
                  }}
                  className={`cursor-pointer rounded-lg overflow-hidden border transition-all ${
                    selectedMovie?.movie_id === movie.movie_id
                      ? 'border-red-600'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <img
                    src={movie.image_url || '/placeholder.jpg'}
                    alt={movie.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-2">
                    <p className="font-medium text-sm truncate">{movie.title}</p>
                    <p className="text-xs text-gray-400">{movie.duration} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Showtime */}
        {currentStep === 'showtime' && (
          <div className="bg-[#0b0b0b] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Select Showtime</h2>
              <button onClick={() => setCurrentStep('movie')} className="text-gray-400 hover:text-white">
                ← Back
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-400">Movie:</p>
              <p className="font-medium">{selectedMovie?.title}</p>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Select Date:</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                      selectedDate === date ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {new Date(date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                  </button>
                ))}
              </div>
            </div>

            {/* Theater Filter */}
            {theaters.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Filter by Theater:</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedTheaterId(null)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                      selectedTheaterId === null ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    All Theaters
                  </button>
                  {theaters.map((theater) => (
                    <button
                      key={theater.theater_id}
                      onClick={() => setSelectedTheaterId(theater.theater_id)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                        selectedTheaterId === theater.theater_id ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {theater.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Showtimes */}
            <div className="max-h-[50vh] overflow-y-auto">
              {loading ? (
                <p className="text-gray-400 text-center py-8">Loading showtimes...</p>
              ) : filteredShowtimes.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No showtimes available{selectedDate ? ' for selected date' : ''}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredShowtimes.map((showtime, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedShowtime(showtime);
                          setCurrentStep('seats');
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedShowtime === showtime
                            ? 'border-red-600 bg-red-900/20'
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <p className="font-medium">{showtime.theater_name}</p>
                        <p className="text-sm text-gray-400">Screen {showtime.screen_number}</p>
                        <p className="text-sm text-gray-400">
                          {showtime.start_time.slice(0, 5)} - {showtime.end_time.slice(0, 5)}
                        </p>
                        {(showtime.format || showtime.auditorium_format) && (
                          <p className="text-xs text-yellow-500 mt-1">{showtime.format || showtime.auditorium_format}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Step 4: Select Seats */}
        {currentStep === 'seats' && (
          <div className="bg-[#0b0b0b] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Select Seats</h2>
              <button onClick={() => setCurrentStep('showtime')} className="text-gray-400 hover:text-white">
                ← Back
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-400">
                {selectedMovie?.title} • {selectedShowtime?.theater_name} • Screen {selectedShowtime?.screen_number}
              </p>
              <p className="text-sm text-gray-400">
                {selectedDate} • {selectedShowtime?.start_time.slice(0, 5)}
              </p>
            </div>

            {/* Screen */}
            <div className="mb-8">
              <div className="w-full h-2 bg-gradient-to-b from-gray-400 to-gray-800 rounded-t-full mb-2"></div>
              <p className="text-center text-sm text-gray-400">Screen</p>
            </div>

            {/* Seat Legend */}
            <div className="flex gap-4 justify-center mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-700 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                <span>VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-600 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 rounded"></div>
                <span>Booked</span>
              </div>
            </div>

            {/* Seats Grid */}
            <div className="max-w-4xl mx-auto">
              {Object.keys(seatsByRow).sort().map((row) => (
                <div key={row} className="flex items-center gap-2 mb-2">
                  <span className="w-8 text-center font-medium">{row}</span>
                  <div className="flex gap-2 flex-1 justify-center">
                    {seatsByRow[row].sort((a, b) => {
                      const numA = parseInt(a.seat_number.slice(1));
                      const numB = parseInt(b.seat_number.slice(1));
                      return numA - numB;
                    }).map((seat) => (
                      <button
                        key={seat.seat_number}
                        onClick={() => toggleSeatSelection(seat.seat_number)}
                        disabled={bookedSeats.includes(seat.seat_number)}
                        className={`w-10 h-10 rounded text-sm font-medium transition-all ${getSeatColor(seat.seat_number)}`}
                      >
                        {seat.seat_number.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Seats Summary */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <p className="font-medium mb-2">Selected Seats: {selectedSeats.length}</p>
              <p className="text-sm text-gray-400">{selectedSeats.join(', ') || 'None'}</p>
              <p className="text-lg font-semibold mt-2">Total: {ticketTotal.toLocaleString()} ₫</p>
            </div>

            <button
              onClick={() => setCurrentStep('combos')}
              disabled={selectedSeats.length === 0}
              className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Continue to Combos
            </button>
          </div>
        )}

        {/* Step 5: Add Combos */}
        {currentStep === 'combos' && (
          <div className="bg-[#0b0b0b] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Combos (Optional)</h2>
              <button onClick={() => setCurrentStep('seats')} className="text-gray-400 hover:text-white">
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {combos.map((combo) => {
                const selected = selectedCombos.find(c => c.combo_id === combo.combo_id);
                const quantity = selected?.quantity || 0;

                return (
                  <div key={combo.combo_id} className="bg-gray-800 rounded-lg overflow-hidden">
                    {combo.image_url && (
                      <img src={combo.image_url} alt={combo.name} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4">
                      <p className="font-medium mb-1">{combo.name}</p>
                      <p className="text-sm text-gray-400 mb-3">{combo.price.toLocaleString()} ₫</p>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateComboQuantity(combo.combo_id, Math.max(0, quantity - 1), combo.price)}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 bg-gray-900 rounded min-w-[3rem] text-center">{quantity}</span>
                        <button
                          onClick={() => updateComboQuantity(combo.combo_id, quantity + 1, combo.price)}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <p className="font-medium mb-2">Summary</p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tickets ({selectedSeats.length})</span>
                  <span>{ticketTotal.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Combos</span>
                  <span>{comboTotal.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-700">
                  <span>Total</span>
                  <span>{grandTotal.toLocaleString()} ₫</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('confirm')}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Continue to Confirmation
            </button>
          </div>
        )}

        {/* Step 6: Confirm */}
        {currentStep === 'confirm' && (
          <div className="bg-[#0b0b0b] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Confirm Booking</h2>
              <button onClick={() => setCurrentStep('combos')} className="text-gray-400 hover:text-white">
                ← Back
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Customer</p>
                <p className="font-medium">{selectedCustomer?.name}</p>
                <p className="text-sm text-gray-400">{selectedCustomer?.email}</p>
                <p className="text-sm text-gray-400">{selectedCustomer?.phone}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Movie</p>
                <p className="font-medium">{selectedMovie?.title}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Showtime</p>
                <p className="font-medium">{selectedShowtime?.theater_name}</p>
                <p className="text-sm text-gray-400">Screen {selectedShowtime?.screen_number}</p>
                <p className="text-sm text-gray-400">
                  {selectedDate} • {selectedShowtime?.start_time.slice(0, 5)} - {selectedShowtime?.end_time.slice(0, 5)}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">Seats ({selectedSeats.length})</p>
                <p className="font-medium">{selectedSeats.join(', ')}</p>
              </div>

              {selectedCombos.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Combos</p>
                  {selectedCombos.map((combo) => {
                    const comboData = combos.find(c => c.combo_id === combo.combo_id);
                    return (
                      <div key={combo.combo_id} className="flex justify-between text-sm mb-1">
                        <span>{comboData?.name} x{combo.quantity}</span>
                        <span>{(combo.price * combo.quantity).toLocaleString()} ₫</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Grand Total</span>
                  <span className="text-2xl font-bold">{grandTotal.toLocaleString()} ₫</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Payment: Cash (Unpaid)</p>
              </div>
            </div>

            <button
              onClick={handleSubmitBooking}
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-lg"
            >
              {loading ? 'Creating Booking...' : 'Confirm & Create Booking'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateBookingPage;
