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

interface Auditorium {
  auditorium_id: number;
  format: string;  // 2D, 3D, IMAX
}

interface Showtime {
  showtime_id: number;
  movie_id: number;
  theater_name: string;
  auditorium_id: number;
  format: string;  // Format should be based on auditorium
  start_time: string;
  date: string;
  price: number;
}

const ShowtimePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [auditoriums, setAuditoriums] = useState<Auditorium[]>([]);  // Store available auditoriums for a selected theater
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShowtime, setNewShowtime] = useState({
    movie_id: '',
    theater_id: '',
    auditorium_id: '',
    date: '',
    start_time: '',
    format: '2D',  // Default format
    price: 0,
  });

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
        const res = await fetch(`${API_BASE}/showtimes`);
        if (!res.ok) throw new Error('Failed to fetch showtimes');

        const data = await res.json();
        setShowtimes(data.showtimes);
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchShowtimes();
  }, []);

  // Fetch available auditoriums for a selected theater
  const fetchAuditoriumsForTheater = async (theaterId: string) => {
    try {
      const res = await fetch(`${API_BASE}/showtimes/theaters/${theaterId}/auditoriums`);
      if (!res.ok) throw new Error('Failed to fetch auditoriums');

      const data = await res.json();
      setAuditoriums(data.auditoriums); // Update auditoriums based on the selected theater
    } catch (err: any) {
      console.error(err);
    }
  };

  // Toggle modal visibility
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle input changes for the new showtime
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewShowtime((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // If theater is changed, fetch available auditoriums
    if (name === 'theater_id') {
      fetchAuditoriumsForTheater(value);
    }
  };

  // Handle form submission for adding a new showtime
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/showtimes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShowtime),
      });

      if (!res.ok) throw new Error('Failed to add showtime');
      const data = await res.json();
      setShowtimes([...showtimes, data.showtime]); // Add the new showtime to the list
      closeModal(); // Close modal after submitting
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
            CA
          </div>
          <div>
            <div className="text-lg font-semibold leading-none">CineAdmin</div>
            <div className="text-xs text-gray-400 mt-1">Staff Panel</div>
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

        <p className="mt-1 text-sm text-gray-400">Manage your cinema showtimes here.</p>

        {/* Showtimes Table */}
        <section className="mt-6">
          <table className="min-w-full bg-[#101010] rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Movie Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Theater</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Format</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((showtime) => {
                const movie = movies.find((movie) => movie.movie_id === showtime.movie_id);
                return (
                  <tr key={showtime.showtime_id}>
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
                    <td className="px-6 py-4 text-sm text-gray-300">{showtime.theater_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{`${showtime.date} ${showtime.start_time}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{showtime.format}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/staff/showtimes/edit/${showtime.showtime_id}`}
                        className="text-blue-500 hover:text-blue-300"
                      >
                        Edit
                      </Link>
                      <span className="mx-2">|</span>
                      <button
                        onClick={() => handleDelete(showtime.showtime_id)}
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
                    <option key={theater.theater_id} value={theater.theater_id}>
                      {theater.name}
                    </option>
                  ))}
                </select>
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
                <label className="block text-sm text-gray-400">Price (VND)</label>
                <input
                  type="number"
                  name="price"
                  value={newShowtime.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                  required
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
