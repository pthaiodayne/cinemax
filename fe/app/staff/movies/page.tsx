'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Movie {
  movie_id: number;
  title: string;
  image_url?: string;
  genres?: string[];
  release_date?: string;
  plot_description?: string;
  rating?: number;
}

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);  // Modal state
  const [newMovie, setNewMovie] = useState({
    title: '',
    genres: '',
    age_restriction: '',
  });

  // Fetch movies from the backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API_BASE}/movies`);
        if (!res.ok) throw new Error('Failed to fetch movies');

        const data = await res.json();
        setMovies(data.movies); // Assumes the response contains an array of movies
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchMovies();
  }, []);

  // Toggle modal visibility
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle input changes for the new movie
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMovie((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission for adding a new movie
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const movieData = {
      title: newMovie.title,
      genres: newMovie.genres.split(',').map((genre) => genre.trim()),
      age_restriction: newMovie.age_restriction,
    };

    try {
      const res = await fetch(`${API_BASE}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      });

      if (!res.ok) throw new Error('Failed to add movie');
      const data = await res.json();
      setMovies([...movies, data.movie]); // Add the new movie to the list
      closeModal(); // Close modal after submitting
    } catch (err: any) {
      console.error(err);
    }
  };

  // Delete movie by ID
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/movies/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        console.error('Failed to delete movie');
      } else {
        setMovies(movies.filter((movie) => movie.movie_id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting movie:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b0b0b] border-r border-[#242424] flex flex-col">
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-xs">
              ⌂
            </span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/staff/movies"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              🎬
            </span>
            <span>Movies</span>
          </Link>

          <Link
            href="/staff/showtimes"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              🕒
            </span>
            <span>Showtimes</span>
          </Link>

          <Link
            href="/staff/bookings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              🎟️
            </span>
            <span>Bookings</span>
          </Link>

          <Link
            href="/staff/combos"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              🍿
            </span>
            <span>Combos</span>
          </Link>

          <Link
            href="/staff/customers"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              👥
            </span>
            <span>Customers</span>
          </Link>
        </nav>

        <div className="border-t border-[#242424] px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm text-gray-300 hover:text-white"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              ⮌
            </span>
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-8 py-6 bg-[#050505]">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Movies</h1>
          {/* Add Movie Button */}
          <button
            onClick={openModal}
            className="px-6 py-2 bg-red-600 text-white rounded-lg text-lg"
          >
            + Add Movie
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-400">Manage your cinema movies here.</p>

        {/* Movies Table */}
        <section className="mt-6">
          <table className="min-w-full bg-[#101010] rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Genres</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Release Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.movie_id}>
                  <td className="px-6 py-4 text-sm text-gray-300 flex items-center gap-3">
                    {movie.image_url && (
                      <img
                        src={movie.image_url}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded-md"
                      />
                    )}
                    {movie.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {movie.genres?.join(', ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{movie.release_date?.slice(0, 10) || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/staff/movies/edit/${movie.movie_id}`} className="text-blue-500 hover:text-blue-300">
                      Edit
                    </Link>
                    <span className="mx-2">|</span>
                    <button
                      onClick={() => handleDelete(movie.movie_id)}
                      className="text-red-500 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Add Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-[#111] p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">Add New Movie</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-400">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newMovie.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400">Genres (comma-separated)</label>
                <input
                  type="text"
                  name="genres"
                  value={newMovie.genres}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#222] text-white rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400">Age Restriction</label>
                <input
                  type="text"
                  name="age_restriction"
                  value={newMovie.age_restriction}
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
                  Add Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
