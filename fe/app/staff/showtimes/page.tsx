'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Movie {
  movie_id: number;
  title: string;
  image_url: string;
}

interface Theater {
  theater_id: number;
  name: string;
}

interface Showtime {
  // backend có thể có hoặc không có id riêng, nên để optional
  showtime_id?: number;
  movie_id: number;
  theater_id: number;
  theater_name: string;
  screen_number: number;
  start_time: string;
  end_time: string;
  date: string;
  format?: string;
  price?: number;
}

const ShowtimePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('Staff');
  const [userRole, setUserRole] = useState('staff');
  const [newShowtime, setNewShowtime] = useState({
    movie_id: '',
    theater_id: '',
    screen_number: '',
    date: '',
    start_time: '',
    format: '2D', // vẫn giữ nếu sau này backend join từ Auditorium
    price: 0,
  });
  const [filters, setFilters] = useState({
      movie_id: '',
      theater_id: '',
      date: '',
  });


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

  // Fetch all movies from the backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API_BASE}/movies`);
        if (!res.ok) throw new Error('Failed to fetch movies');

        const data = await res.json();
        setMovies(data.movies);
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchMovies();
  }, []);

  // Fetch all theaters from the backend
  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const res = await fetch(`${API_BASE}/showtimes/theaters`);
        if (!res.ok) throw new Error('Failed to fetch theaters');

        const data = await res.json();
        setTheaters(data.theaters);
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchTheaters();
  }, []);

  // Fetch all showtimes from the backend
  useEffect(() => {
  const fetchShowtimes = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.movie_id) params.append('movie_id', filters.movie_id);
      if (filters.theater_id) params.append('theater_id', filters.theater_id);
      if (filters.date) params.append('date', filters.date);

      const res = await fetch(`${API_BASE}/showtimes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch showtimes');

      const data = await res.json();
      setShowtimes(data.showtimes);
    } catch (err) {
      console.error(err);
    }
  };

  fetchShowtimes();
}, [filters]); // ✅ refetch when filters change


  // Toggle modal visibility
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle input changes for the new showtime
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewShowtime((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('You are not logged in');
    return;
  }

  try {
    let start_time = newShowtime.start_time;
    if (start_time.length === 5) start_time += ':00';

    const [h, m, s] = start_time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, s || 0);
    d.setMinutes(d.getMinutes() + 120);

    const end_time = d.toTimeString().slice(0, 8);

    const payload = {
      movie_id: Number(newShowtime.movie_id),
      theater_id: Number(newShowtime.theater_id),
      screen_number: Number(newShowtime.screen_number),
      date: newShowtime.date,
      start_time,
      end_time,
      format: newShowtime.format,
      price: Number(newShowtime.price),
    };

    const res = await fetch(`${API_BASE}/showtimes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to add showtime:', errorText);
      throw new Error(errorText);
    }

    const data = await res.json();
    setShowtimes((prev) => [...prev, data.showtime]);
    closeModal();
  } catch (err) {
    console.error(err);
  }
};


  // Delete showtime theo composite key backend đang dùng
  const handleDelete = async (showtime: Showtime) => {
    try {
      const params = new URLSearchParams({
        theater_id: String(showtime.theater_id),
        screen_number: String(showtime.screen_number),
        start_time: showtime.start_time,
        end_time: showtime.end_time,
        date: showtime.date,
      });

      const res = await fetch(
        `${API_BASE}/showtimes?${params.toString()}`,
        {
          method: 'DELETE',
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to delete showtime:', errorText);
        throw new Error('Failed to delete showtime');
      }

      setShowtimes((prev) =>
        prev.filter(
          (s) =>
            !(
              s.theater_id === showtime.theater_id &&
              s.screen_number === showtime.screen_number &&
              s.start_time === showtime.start_time &&
              s.end_time === showtime.end_time &&
              s.date === showtime.date
            )
        )
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* SIDEBAR */}
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
          <Link
            href="/staff/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              ⌂
            </span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/staff/bookings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              🎟️
            </span>
            <span>Bookings</span>
          </Link>

          <Link
            href="/staff/customers"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              👥
            </span>
            <span>Customers</span>
          </Link>

          <Link
            href="/staff/movies"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              🎬
            </span>
            <span>Movies</span>
          </Link>

          <Link
            href="/staff/showtimes"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-600 text-sm font-medium"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-xs">
              🕒
            </span>
            <span>Showtimes</span>
          </Link>

          <Link
            href="/staff/combos"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              🍿
            </span>
            <span>Combos</span>
          </Link>
        </nav>
      </aside>
      

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 px-8 py-6 bg-[#050505]">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Showtimes</h1>
          {/* Add Showtime Button */}
          <button
            onClick={openModal}
            className="px-6 py-2 bg-red-600 text-white rounded-lg text-lg"
          >
            + Add Showtime
          </button>
        </div>
        

        <p className="mt-1 text-sm text-gray-400">
          Manage your cinema showtimes here.
        </p>
        {/* ================= FILTER PANEL ================= */}
<div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#101010] p-4 rounded-lg">

  {/* Movie Filter */}
  <div>
    <label className="block text-sm text-gray-400 mb-1">Movie</label>
    <select
      name="movie_id"
      value={filters.movie_id}
      onChange={handleFilterChange}
      className="w-full px-3 py-2 bg-[#222] rounded"
    >
      <option value="">All Movies</option>
      {movies.map(movie => (
        <option key={movie.movie_id} value={movie.movie_id}>
          {movie.title}
        </option>
      ))}
    </select>
  </div>

  {/* Theater Filter */}
  <div>
    <label className="block text-sm text-gray-400 mb-1">Theater</label>
    <select
      name="theater_id"
      value={filters.theater_id}
      onChange={handleFilterChange}
      className="w-full px-3 py-2 bg-[#222] rounded"
    >
      <option value="">All Theaters</option>
      {theaters.map(t => (
        <option key={t.theater_id} value={t.theater_id}>
          {t.name}
        </option>
      ))}
    </select>
  </div>

  {/* Date Filter */}
  <div>
    <label className="block text-sm text-gray-400 mb-1">Date</label>
    <input
      type="date"
      name="date"
      value={filters.date}
      onChange={handleFilterChange}
      className="w-full px-3 py-2 bg-[#222] rounded"
    />
  </div>

      {/* Reset Button */}
      <div className="flex items-end">
        <button
          onClick={() =>
            setFilters({ movie_id: '', theater_id: '', date: '' })
          }
          className="w-full px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>


        {/* Showtimes Table */}
        <section className="mt-6">
          <table className="min-w-full bg-[#101010] rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Movie Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Theater
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Screen
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Start Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  End Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Format
                </th>


                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((showtime, index) => {
                const movie = movies.find(
                  (movie) => movie.movie_id === showtime.movie_id
                );
                return (
                  <tr
                    key={
                      showtime.showtime_id ??
                      `${showtime.theater_id}-${showtime.screen_number}-${showtime.date}-${showtime.start_time}`
                    }
                  >
                    <td className="px-6 py-4 text-sm text-gray-300 flex items-center gap-3">
                      {movie?.image_url && (
                        <img
                          src={movie.image_url}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-md"
                        />
                      )}
                      <span>{movie?.title}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {showtime.theater_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {showtime.screen_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {showtime.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {showtime.start_time}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {showtime.end_time}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {showtime.format ?? '-'}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {showtime.showtime_id && (
                        <>
                          <Link
                            href={`/staff/showtimes/edit/${showtime.showtime_id}`}
                            className="text-blue-500 hover:text-blue-300"
                          >
                            Edit
                          </Link>
                          <span className="mx-2">|</span>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(showtime)}
                        className="text-red-500 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>

      {/* Add Showtime Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-[#111] p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">Add New Showtime</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-400">Movie</label>
                <select
                  name="movie_id"
                  value={newShowtime.movie_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                  required
                >
                  <option value="">Select movie</option>
                  {movies.map((movie) => (
                    <option key={movie.movie_id} value={movie.movie_id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400">Theater</label>
                <select
                  name="theater_id"
                  value={newShowtime.theater_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                  required
                >
                  <option value="">Select theater</option>
                  {theaters.map((theater) => (
                    <option
                      key={theater.theater_id}
                      value={theater.theater_id}
                    >
                      {theater.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400">
                  Screen Number
                </label>
                <input
                  type="number"
                  name="screen_number"
                  value={newShowtime.screen_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                  required
                  min={1}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newShowtime.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400">Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={newShowtime.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400">Format</label>
                <select
                  name="format"
                  value={newShowtime.format}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400">
                  Price (VND)
                </label>
                <input
                  type="number"
                  name="price"
                  value={newShowtime.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                  required
                  min={0}
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-lg"
                >
                  Add Showtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowtimePage;



