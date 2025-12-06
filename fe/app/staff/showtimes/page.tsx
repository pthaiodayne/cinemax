'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Movie {
  movie_id: number;
  title: string;
  formats: string[]; // Thêm trường formats để lưu danh sách định dạng
}

interface Theater {
  theater_id: number;
  name: string;
  location: string;
}

interface Showtime {
  id: number;
  movie_id: number;
  movie_title: string;
  theater_id: number;
  theater_name: string;
  date: string;
  start_time: string;
  format: string;
  seatsLeft: number;
}

const ShowtimesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [showtimeData, setShowtimeData] = useState({
    movie_id: '',
    theater_id: '',
    date: '',
    time: '',
    format: '2D',
  });

  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      const res = await fetch(`${API_BASE}/movies`);
      const data = await res.json();
      setMovies(data.movies);
    };

    const fetchTheaters = async () => {
      const res = await fetch(`${API_BASE}/showtimes/theaters`);
      const data = await res.json();
      setTheaters(data.theaters);
    };

    const fetchShowtimes = async () => {
      const res = await fetch(`${API_BASE}/showtimes`);
      const data = await res.json();
      const showtimesWithMovie = data.showtimes.map((showtime: Showtime) => {
        const movie = movies.find((movie) => movie.movie_id === showtime.movie_id);
        return {
          ...showtime,
          movie_title: movie ? movie.title : 'Unknown Movie',
          format: movie?.formats.join(', ') || 'Unknown Format', // Thêm định dạng vào showtime
        };
      });
      setShowtimes(showtimesWithMovie);
    };

    fetchMovies();
    fetchTheaters();
    fetchShowtimes();
  }, [movies]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShowtimeData({
      ...showtimeData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newShowtime = {
      movie_id: showtimeData.movie_id,
      theater_id: showtimeData.theater_id,
      date: showtimeData.date,
      start_time: showtimeData.time,
      format: showtimeData.format,
    };

    const res = await fetch(`${API_BASE}/showtimes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newShowtime),
    });

    if (res.ok) {
      const data = await res.json();
      setShowtimes((prevShowtimes) => [...prevShowtimes, data.showtime]);
      setShowModal(false);
    } else {
      alert('Failed to add showtime');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${API_BASE}/showtimes/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setShowtimes((prevShowtimes) =>
        prevShowtimes.filter((showtime) => showtime.id !== id)
      );
    } else {
      alert('Failed to delete showtime');
    }
  };

  const handleEdit = async (id: number) => {
    const showtime = showtimes.find((showtime) => showtime.id === id);
    if (showtime) {
      setShowtimeData({
        movie_id: showtime.movie_id.toString(),
        theater_id: showtime.theater_id.toString(),
        date: showtime.date,
        time: showtime.start_time,
        format: showtime.format,
      });
      setShowModal(true);
    }
  };

  const formatDate = (date: string) => {
    const dt = new Date(date);
    return dt.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    // Chỉ hiển thị giờ mà không có phần "17:00:00.000Z"
    const date = new Date(time);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0b0b0b] text-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-red-600 text-sm font-semibold">
            CA
          </div>
          <div>
            <div className="text-lg font-semibold leading-none">CineAdmin</div>
            <div className="text-xs text-gray-400 mt-1">Staff Panel</div>
          </div>
        </div>
        <nav className="space-y-1">
          <Link
            href="/staff/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-xs">
              ⌂
            </span>
            <span>Dashboard</span>
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
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              🕒
            </span>
            <span>Showtimes</span>
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
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#141414] text-white p-6">
        <h1 className="text-3xl font-semibold mb-6">Showtimes</h1>
        <p className="text-lg text-gray-400 mb-6">Manage movie schedules and screenings</p>

        {/* Add Showtime Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}  // Show modal when clicked
            className="px-6 py-3 bg-red-600 text-white rounded-lg"
          >
            + Add Showtime
          </button>
        </div>

        {/* Showtime Table */}
        <table className="w-full text-left text-gray-400">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4">Movie</th>
              <th className="py-3 px-4">Theater</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((showtime) => (
              <tr key={showtime.id} className="border-b border-gray-700">
                <td className="py-3 px-4 text-white">{showtime.movie_title}</td>
                <td className="py-3 px-4">{showtime.theater_name}</td>
                <td className="py-3 px-4">
                  {formatTime(showtime.start_time)} <br /> {formatDate(showtime.date)}
                </td>
                <td className="py-3 px-4">{showtime.format}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEdit(showtime.id)}
                    className="text-yellow-400 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(showtime.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add Showtime */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-10">
          <div className="bg-[#121212] p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Add New Showtime</h3>
            <form onSubmit={handleSubmit}>
              {/* Movie Dropdown */}
              <div className="mb-4">
                <label className="block text-sm text-white mb-2">Movie</label>
                <select
                  name="movie_id"
                  value={showtimeData.movie_id}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#181818] text-white rounded-md"
                >
                  <option value="">Select movie</option>
                  {movies.map((movie) => (
                    <option key={movie.movie_id} value={movie.movie_id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theater Dropdown */}
              <div className="mb-4">
                <label className="block text-sm text-white mb-2">Theater</label>
                <select
                  name="theater_id"
                  value={showtimeData.theater_id}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#181818] text-white rounded-md"
                >
                  <option value="">Select theater</option>
                  {theaters.map((theater) => (
                    <option key={theater.theater_id} value={theater.theater_id}>
                      {theater.name} - {theater.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="mb-4">
                <label className="block text-sm text-white mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={showtimeData.date}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#181818] text-white rounded-md"
                  required
                />
              </div>

              {/* Time Input */}
              <div className="mb-4">
                <label className="block text-sm text-white mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  value={showtimeData.time}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#181818] text-white rounded-md"
                  required
                />
              </div>

              {/* Format Dropdown */}
              <div className="mb-4">
                <label className="block text-sm text-white mb-2">Format</label>
                <select
                  name="format"
                  value={showtimeData.format}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#181818] text-white rounded-md"
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                  <option value="4DX">4DX</option>
                </select>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="flex justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 text-white rounded-lg"
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

export default ShowtimesPage;
