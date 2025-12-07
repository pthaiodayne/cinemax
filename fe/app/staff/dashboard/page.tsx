'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ====== TYPES ======
interface BookingFromApi {
  booking_id: number;
  payment_method: string;
  discount_amount: number;
  amount_paid: number;
  date_time: string;
  user_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  ticket_count: number;
}

interface BookingApiResponse {
  count: number;
  bookings: BookingFromApi[];
}

interface Movie {
  movie_id: number;
  title: string;
  image_url?: string;  // Added image_url field
  formats?: string[];
}

const SAMPLE_BOOKINGS: BookingFromApi[] = [
  {
    booking_id: 1001,
    payment_method: 'Credit Card',
    discount_amount: 0,
    amount_paid: 439000,
    date_time: new Date().toISOString(),
    user_id: 1,
    customer_name: 'Nguyen Van A',
    customer_email: 'a@example.com',
    customer_phone: '0123456789',
    ticket_count: 2,
  },
  {
    booking_id: 1002,
    payment_method: 'Momo',
    discount_amount: 0,
    amount_paid: 444000,
    date_time: new Date().toISOString(),
    user_id: 1,
    customer_name: 'Tran Thi B',
    customer_email: 'b@example.com',
    customer_phone: '0987654321',
    ticket_count: 3,
  },
];

// Dashboard Component
const StaffDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<BookingFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [movies, setMovies] = useState<Movie[]>([]);

  // Fetch bookings from backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/bookings`, {
          credentials: 'include',
        });

        if (!res.ok) {
          console.warn('Failed to fetch bookings, using sample data');
          setBookings([]);
          setError(`Bookings API: ${res.status}`);
        } else {
          const data: BookingApiResponse = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Something went wrong');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Calculate Total Revenue and Tickets Sold
  const totalRevenue = useMemo(
    () =>
      (bookings.length ? bookings : SAMPLE_BOOKINGS).reduce(
        (sum, b) =>
          sum + (isNaN(Number(b.amount_paid)) ? 0 : Number(b.amount_paid)),
        0
      ),
    [bookings]
  );

  const ticketsSold = useMemo(
    () =>
      (bookings.length ? bookings : SAMPLE_BOOKINGS).reduce(
        (sum, b) =>
          sum + (isNaN(Number(b.ticket_count)) ? 0 : Number(b.ticket_count)),
        0
      ),
    [bookings]
  );

  const activeMovies = 3; // mock
  const totalCustomers = 1234; // mock

  // Fetch Movies
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

  // Get Recent Bookings
  const recentBookings = useMemo(() => {
    const source = bookings.length ? bookings : SAMPLE_BOOKINGS;
    return [...source]
      .sort(
        (a, b) =>
          new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
      )
      .slice(0, 3);
  }, [bookings]);

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
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-600 text-sm font-medium"
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
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
            href="/staff/combos"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
              🍿
            </span>
            <span>Combos</span>
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

      {/* MAIN */}
      <main className="flex-1 px-8 py-6 bg-[#050505]">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">
            Welcome back! Here's your cinema overview.
          </p>
        </div>

        {loading && (
          <div className="mt-4 text-sm text-gray-400">Loading data…</div>
        )}

        {/* CARDS */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Revenue */}
          <div className="relative overflow-hidden rounded-2xl bg-[#101010] px-5 py-4 border border-[#242424]">
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-400">Total Revenue</div>
                <div className="mt-2 text-2xl font-semibold">
                  {totalRevenue.toLocaleString('vi-VN')} ₫
                </div>
                <div className="mt-1 text-xs text-emerald-400">
                  +0% from last week
                </div>
              </div>
              <div className="self-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                  <span className="text-lg">₫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div className="relative overflow-hidden rounded-2xl bg-[#101010] px-5 py-4 border border-[#242424]">
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-400">Tickets Sold</div>
                <div className="mt-2 text-2xl font-semibold">{ticketsSold}</div>
                <div className="mt-1 text-xs text-emerald-400">
                  +0% from last week
                </div>
              </div>
              <div className="self-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                  <span className="text-lg">🎟️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Movies */}
          <div className="relative overflow-hidden rounded-2xl bg-[#101010] px-5 py-4 border border-[#242424]">
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-400">Active Movies</div>
                <div className="mt-2 text-2xl font-semibold">
                  {activeMovies}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Total running now
                </div>
              </div>
              <div className="self-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                  <span className="text-lg">🎬</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="relative overflow-hidden rounded-2xl bg-[#101010] px-5 py-4 border border-[#242424]">
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-400">Total Customers</div>
                <div className="mt-2 text-2xl font-semibold">
                  {totalCustomers.toLocaleString('vi-VN')}
                </div>
                <div className="mt-1 text-xs text-emerald-400">
                  +0% from last week
                </div>
              </div>
              <div className="self-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                  <span className="text-lg">👥</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM PANELS */}
        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Recent bookings */}
          <div className="rounded-2xl bg-[#101010] border border-[#242424]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#242424]">
              <h2 className="text-sm font-semibold">Recent Bookings</h2>
              <span className="text-xs text-red-400">⭡ live</span>
            </div>

            <div className="px-5 py-4 space-y-4">
              {recentBookings.map((b) => (
                <div key={b.booking_id} className="flex items-center gap-4">
                  <div className="h-11 w-16 overflow-hidden rounded-md bg-[#181818]" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      Booking #{b.booking_id}
                    </div>
                    <div className="text-xs text-gray-400">
                      {b.customer_name} • {b.ticket_count} tickets
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {new Date(b.date_time).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-amber-300">
                      {Number(b.amount_paid).toLocaleString('vi-VN')} ₫
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {b.payment_method}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top performing movies */}
          <div className="rounded-2xl bg-[#101010] border border-[#242424]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#242424]">
              <h2 className="text-sm font-semibold">Top Performing Movies</h2>
              <span className="text-xs text-gray-500">average rating (1–5)</span>
            </div>

            <div className="px-5 py-3 space-y-3">
              {movies.map((movie, idx) => (
                <div
                  key={movie.movie_id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#181818]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-700 text-xs font-semibold">
                    {idx + 1}
                  </div>

                  {/* Movie Image */}
                  <div className="h-11 w-11 rounded-md bg-[#181818] shrink-0">
                    {movie.image_url ? (
                      <img
                        src={movie.image_url}
                        alt={movie.title}
                        className="object-cover h-full w-full rounded-md"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">No Poster</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium">{movie.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StaffDashboard;
