'use client';

import { useEffect, useMemo, useState } from 'react';
import StaffSidebar from '../../components/StaffSidebar';

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
  const [staffName, setStaffName] = useState('Staff');
  const [staffRole, setStaffRole] = useState('staff');

  /* ===== ROLE GUARD ===== */
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.userType !== 'staff') {
          window.location.href = '/';
        }
        setStaffName(user.name || 'Staff');
        setStaffRole(user.role || 'staff');
      } catch {
        window.location.href = '/';
      }
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

        if (!bRes.ok) {
          console.error('Bookings response:', bRes.status, bRes.statusText);
          throw new Error('Bookings denied');
        }
        if (!mRes.ok) {
          console.error('Movies response:', mRes.status, mRes.statusText);
          throw new Error('Movies failed');
        }

        const bData = await bRes.json();
        const mData = await mRes.json();

        console.log('Bookings data:', bData);
        console.log('Movies data:', mData);

        setBookings(bData.bookings || []);
        setMovies(mData.movies || []);
      } catch (e) {
        console.error('Dashboard load error:', e);
        alert('Failed to load dashboard data: ' + (e instanceof Error ? e.message : String(e)));
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
      <StaffSidebar activePage="dashboard" />

      {/* MAIN */}
      <main className="ml-64 flex-1 px-8 py-6 bg-[#050505] min-h-screen">
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
