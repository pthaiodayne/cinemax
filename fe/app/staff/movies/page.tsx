'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const MoviesPage = () => {
  const [showModal, setShowModal] = useState(false); // State to show/hide modal
  const [movieData, setMovieData] = useState({
    title: '',
    description: '',
    duration: '',
    rating: '',
    genres: '',
    ageRestriction: '',
    status: 'Now Showing',
  });

  // Handle changes in input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMovieData({
      ...movieData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(movieData); // Log the movie data
    setShowModal(false); // Close modal after submission
  };

  const movies = [
    {
      title: 'Dune: Part Two',
      duration: '166 min',
      genre: ['Sci-Fi', 'Adventure'],
      status: 'Showing',
      rating: '8.8',
      ageRestriction: 'PG-13',
    },
    {
      title: 'Godzilla x Kong',
      duration: '115 min',
      genre: ['Action', 'Sci-Fi'],
      status: 'Showing',
      rating: '7.5',
      ageRestriction: 'PG-13',
    },
    {
      title: 'Kung Fu Panda 4',
      duration: '94 min',
      genre: ['Animation', 'Comedy'],
      status: 'Showing',
      rating: '7.2',
      ageRestriction: 'PG',
    },
    {
      title: 'Deadpool 3',
      duration: '127 min',
      genre: ['Action', 'Comedy'],
      status: 'Upcoming',
      rating: '0',
      ageRestriction: 'R',
    },
    {
      title: 'Furiosa',
      duration: '148 min',
      genre: ['Action', 'Adventure'],
      status: 'Upcoming',
      rating: '0',
      ageRestriction: 'R',
    },
    {
      title: 'Inside Out 2',
      duration: '96 min',
      genre: ['Animation', 'Comedy'],
      status: 'Upcoming',
      rating: '0',
      ageRestriction: 'PG',
    },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">CineAdmin</div>
        <nav>
          <ul>
            <li>
              <Link href="/staff/dashboard">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Dashboard</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/movies">
                <button className="w-full py-2 px-4 bg-red-600 rounded-md">Movies</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/showtimes">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Showtimes</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/bookings">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Bookings</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/customers">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Customers</button>
              </Link>
            </li>
               <li>
              <Link href="/staff/combos">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Combos</button>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#141414] text-white p-6">
        <h1 className="text-3xl font-semibold mb-6">Movies</h1>
        <p className="text-lg text-gray-400 mb-6">Manage your movie catalog</p>

        {/* Add Movie Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}  // Show modal when clicked
            className="px-6 py-3 bg-red-600 text-white rounded-lg"
          >
            + Add Movie
          </button>
        </div>

        {/* Movie Table */}
        <table className="movie-table w-full text-left text-gray-400">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4">Movie</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Genre</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="py-3 px-4 text-white">{movie.title}</td>
                <td className="py-3 px-4">{movie.duration}</td>
                <td className="py-3 px-4">{movie.genre.join(', ')}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-md ${movie.status === 'Showing' ? 'bg-green-500' : 'bg-blue-500'}`}
                  >
                    {movie.status}
                  </span>
                </td>
                <td className="py-3 px-4">{movie.rating}</td>
                <td className="py-3 px-4">
                  <button className="text-yellow-400 mr-4">Edit</button>
                  <button className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add Movie */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-semibold mb-4">Add New Movie</h2>
            <form onSubmit={handleSubmit}>
              {/* Movie Title */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={movieData.title}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  required
                />
              </div>

              {/* Movie Description */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Description</label>
                <textarea
                  name="description"
                  value={movieData.description}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  required
                />
              </div>

              {/* Duration */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Duration (min)</label>
                <input
                  type="number"
                  name="duration"
                  value={movieData.duration}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  required
                />
              </div>

              {/* Rating */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Rating</label>
                <input
                  type="number"
                  name="rating"
                  value={movieData.rating}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  required
                  step="0.1"
                  min="0"
                  max="10"
                />
              </div>

              {/* Genres */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Genres (comma-separated)</label>
                <input
                  type="text"
                  name="genres"
                  value={movieData.genres}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  required
                />
              </div>

              {/* Age Restriction */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Age Restriction</label>
                <input
                  type="text"
                  name="ageRestriction"
                  value={movieData.ageRestriction}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                  required
                />
              </div>

              {/* Status */}
              <div className="form-group mb-4">
                <label className="block text-white mb-2">Status</label>
                <select
                  name="status"
                  value={movieData.status}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-md"
                >
                  <option value="Now Showing">Now Showing</option>
                  <option value="Upcoming">Upcoming</option>
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
                  Add Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .sidebar {
          width: 250px;
          min-width: 250px;
          background-color: #141414;
          color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .modal-content {
          background-color: #222;
          padding: 30px;
          border-radius: 8px;
          width: 400px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: white;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          background-color: #333;
          color: white;
          border: 1px solid #555;
          border-radius: 8px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .bg-gray-700 {
          background-color: #333;
        }

        .bg-red-600 {
          background-color: #e53e3e;
        }

        .bg-gray-500 {
          background-color: #6b7280;
        }

        .text-white {
          color: white;
        }

        .rounded-lg {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default MoviesPage;
