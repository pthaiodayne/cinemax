'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Movie {
  movie_id: number;
  title: string;
  image_url?: string;
  genres: string[];
  format: string[];
  release_date?: string;
  rating?: number;
}
const GENRE_OPTIONS = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Animation',
  'Fantasy',
  'Adventure',
];
const FORMAT_OPTIONS = ['2D', '3D', 'IMAX', '4D'];
const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('Staff');
  const [userRole, setUserRole] = useState('staff');

  const [newMovie, setNewMovie] = useState({
    title: '',
    genres: [] as string[],
    formats: [] as string[],
    age_restrict: '',
    duration: '',
    release_date: '',
    plot_description: '',
    production_company: '',
    image_url: '',
  });


  /* ===================== LOAD USER INFO ===================== */
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

  /* ===================== FETCH MOVIES ===================== */
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API_BASE}/movies`);
        if (!res.ok) throw new Error('Failed to fetch movies');
        const data = await res.json();
        setMovies(data.movies || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMovies();
  }, []);

  /* ===================== MODAL ===================== */
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewMovie(prev => ({ ...prev, [name]: value }));
  };

  /* ===================== ADD MOVIE ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      return;
    }

    const movieData = {
      title: newMovie.title,
      duration: Number(newMovie.duration),
      release_date: newMovie.release_date,
      plot_description: newMovie.plot_description,
      age_restrict: newMovie.age_restrict,
      production_company: newMovie.production_company,
      image_url: newMovie.image_url,
      genres: newMovie.genres,
      formats: newMovie.formats
    };

    try {
      const res = await fetch(`${API_BASE}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movieData),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();
      setMovies(prev => [...prev, data.movie]);
      closeModal();
    } catch (err) {
      console.error('Add movie error:', err);
      alert('Failed to add movie');
    }
  };

  const handleGenreToggle = (genre: string) => {
  setNewMovie(prev => ({
    ...prev,
    genres: prev.genres.includes(genre)
      ? prev.genres.filter(g => g !== genre)
      : [...prev.genres, genre],
  }));
};

const handleFormatToggle = (format: string) => {
  setNewMovie(prev => ({
    ...prev,
    formats: prev.formats.includes(format)
      ? prev.formats.filter(f => f !== format)
      : [...prev.formats, format],
  }));
};



  /* ===================== DELETE MOVIE ===================== */
const handleDelete = async (id: number) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Session expired. Please login again.');
    return;
  }

  if (!confirm('Are you sure you want to delete this movie?')) return;

  try {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setMovies(prev => prev.filter(m => m.movie_id !== id));
      return;
    }

    // 🔴 Not OK → read error message from backend
    const text = await res.text();
    let msg = 'Failed to delete movie.';
    try {
      const json = JSON.parse(text);
      if (json.error) msg = json.error;
    } catch {
      if (text) msg = text;
    }
    alert(msg);
  } catch (err) {
    console.error(err);
    alert('Something went wrong while deleting movie.');
  }
};

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">

{/* SIDEBAR */}
<aside className="fixed left-0 top-0 h-screen w-64 bg-[#0b0b0b] border-r border-[#242424] flex flex-col">
  {/* Header */}
  <div className="flex items-center gap-2 px-6 py-4 border-b border-[#242424]">
    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-red-600 text-sm font-semibold">
      {userName.substring(0, 2).toUpperCase()}
    </div>
    <div>
      <div className="text-lg font-semibold leading-none">{userName}</div>
      <div className="text-xs text-gray-400 mt-1 capitalize">{userRole}</div>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 px-3 py-4 space-y-1">
    <Link
      href="/staff/dashboard"
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">⌂</span>
      <span>Dashboard</span>
    </Link>

    <Link
      href="/staff/bookings"
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🎟️</span>
      <span>Bookings</span>
    </Link>

    <Link
      href="/staff/customers"
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">👥</span>
      <span>Customers</span>
    </Link>

    <Link
      href="/staff/movies"
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-red-600 text-gray-300 hover:bg-[#181818]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-xs">🎬</span>
      <span>Movies</span>
    </Link>

    <Link
      href="/staff/showtimes"
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🕐</span>
      <span>Showtimes</span>
    </Link>

    <Link
      href="/staff/combos"
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🍿</span>
      <span>Combos</span>
    </Link>
  </nav>
</aside>

      {/* ===================== MAIN ===================== */}
      <main className="flex-1 ml-64 px-8 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Movies</h1>
          <button
            onClick={openModal}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
                <span>+</span>
                <span>Add Movie</span>
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full bg-[#101010] rounded-lg overflow-hidden">
            <thead>
              <tr className="text-gray-400 text-sm">
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Genres</th>
                <th className="px-6 py-4 text-left">Release</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.movie_id} className="border-t border-[#242424]">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {movie.image_url && (
                      <img
                        src={movie.image_url}
                        className="w-12 h-16 rounded object-cover"
                        alt={movie.title}
                      />
                    )}
                    {movie.title}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {movie.genres?.join(', ') || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {movie.release_date?.slice(0, 10) || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(movie.movie_id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ===================== MODAL ===================== */}
      {isModalOpen && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center overflow-y-auto">
      <div className="bg-[#111] p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto my-8">
        <h2 className="text-xl font-semibold mb-4">Add New Movie</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
              {[
                ['title', 'Title'],
                ['age_restrict', 'Age Restriction (16+)'],
                ['duration', 'Duration (minutes)', 'number'],
                ['release_date', '', 'date'],
                ['production_company', 'Production Company'],
                ['image_url', 'Image URL'],
              ].map(([name, label, type]) => (
                <input
                  key={name}
                  type={type || 'text'}
                  name={name}
                  placeholder={label as string}
                  value={(newMovie as any)[name]}
                  onChange={handleChange}
                  required={name !== 'image_url'}
                  className="w-full px-4 py-2 bg-[#222] rounded"
                />
              ))}
              {/* Genres multi-select */}
              <div>
                <label className="block mb-2 text-sm text-gray-400">Genres</label>
                <div className="grid grid-cols-2 gap-2">
                  {GENRE_OPTIONS.map(genre => (
                    <label
                      key={genre}
                      className="flex items-center gap-2 bg-[#222] px-3 py-2 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newMovie.genres.includes(genre)}
                        onChange={() => handleGenreToggle(genre)}
                        className="accent-red-600"
                      />
                      <span>{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Formats multi-select */}
              <div>
                <label className="block mb-2 text-sm text-gray-400">Formats</label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMAT_OPTIONS.map(format => (
                    <label
                      key={format}
                      className="flex items-center gap-2 bg-[#222] px-3 py-2 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newMovie.formats.includes(format)}
                        onChange={() => handleFormatToggle(format)}
                        className="accent-red-600"
                      />
                      <span>{format}</span>
                    </label>
                  ))}
                </div>
              </div>


              <textarea
                name="plot_description"
                placeholder="Plot description"
                value={newMovie.plot_description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#222] rounded"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="bg-red-600 px-4 py-2 rounded">
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
