'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL!;

function fetchWithAuth(url: string) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

interface Booking {
  booking_id: number;
  amount_paid: number;
  payment_method: string;
  date_time: string;
  ticket_count?: number;
}

interface Movie {
  movie_id: number;
  title: string;
  status?: string;
}

export default function StaffDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===== ROLE GUARD ===== */
  useEffect(() => {
    if (localStorage.getItem('role') !== 'staff') {
      window.location.href = '/';
    }
  }, []);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    async function load() {
      try {
        const [bRes, mRes] = await Promise.all([
          fetchWithAuth(`${API}/bookings`),
          fetch(`${API}/movies`),
        ]);

        if (!bRes.ok) throw new Error('Bookings denied');
        if (!mRes.ok) throw new Error('Movies failed');

        const bData = await bRes.json();
        const mData = await mRes.json();

        setBookings(bData.bookings || []);
        setMovies(mData.movies || []);
      } catch (e) {
        console.error(e);
        alert('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ===== STATS ===== */
  const totalRevenue = useMemo(
    () => bookings.reduce((s, b) => s + Number(b.amount_paid || 0), 0),
    [bookings]
  );

  const ticketsSold = useMemo(
    () => bookings.reduce((s, b) => s + (b.ticket_count || 0), 0),
    [bookings]
  );

  const activeMovies = useMemo(
    () => movies.filter(m => m.status === 'ongoing').length,
    [movies]
  );

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort(
          (a, b) =>
            new Date(b.date_time).getTime() -
            new Date(a.date_time).getTime()
        )
        .slice(0, 3),
    [bookings]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">

{/* SIDEBAR */}
<aside className="fixed left-0 top-0 h-screen w-64 bg-[#0b0b0b] border-r border-[#242424] flex flex-col">
  {/* Header */}
  <div className="flex items-center gap-2 px-6 py-4 border-b border-[#242424]">
    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-red-600 text-sm font-semibold">
      CA
    </div>
    <div>
      <div className="text-lg font-semibold leading-none">CineAdmin</div>
      <div className="text-xs text-gray-400 mt-1">Staff Panel</div>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 px-3 py-4 space-y-1">
    <Link
      href="/staff/dashboard"
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-600 text-sm font-medium"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-xs">⌂</span>
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
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🎬</span>
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

    <Link
      href="/"
      className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#181818]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">←</span>
      <span>Back to site</span>
    </Link>
  </nav>
</aside>


      {/* MAIN */}
      <main className="ml-64 flex-1 px-8 py-6">
        <h1 className="text-3xl font-semibold">Dashboard</h1>

        {/* STATS */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Stat title="Revenue" value={`${totalRevenue.toLocaleString('vi-VN')} ₫`} />
          <Stat title="Tickets Sold" value={ticketsSold.toString()} />
          <Stat title="Active Movies" value={activeMovies.toString()} />
        </section>

        {/* RECENT BOOKINGS */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {recentBookings.map(b => (
              <div
                key={b.booking_id}
                className="flex justify-between bg-[#101010] p-4 rounded-lg border border-[#242424]"
              >
                <div>
                  <div className="font-medium">
                    Booking #{b.booking_id}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(b.date_time).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-amber-300 font-semibold">
                    {Number(b.amount_paid).toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="text-xs text-gray-400">
                    {b.payment_method}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#101010] border border-[#242424] rounded-xl p-5">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
