'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch booking data from the backend API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE}/bookings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await res.json();
        setBookings(data.bookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Fetch customer data to link User ID with User Name
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${API_BASE}/customers`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch customers');
        }

        const data = await res.json();
        setUsers(data.customers); // Assuming `data.customers` is the array of users
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers');
      }
    };

    fetchCustomers();
  }, []);

  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) =>
    booking['Booking ID'].toString().includes(searchQuery) ||
    booking['Date & Time'].toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the user name for a specific user ID from the customer data
  const getCustomerName = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">⌂</span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/staff/bookings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-600 text-sm font-medium"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-xs">🎟️</span>
            <span>Bookings</span>
          </Link>

          <Link
            href="/staff/combos"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🍿</span>
            <span>Combos</span>
          </Link>

          <Link
            href="/staff/customers"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">👥</span>
            <span>Customers</span>
          </Link>
        </nav>

        <div className="border-t border-[#242424] px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm text-gray-300 hover:text-white"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">⮌</span>
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-8 py-6 bg-[#050505]">
        <div>
          <h1 className="text-3xl font-semibold mb-6">Bookings</h1>
          <p className="text-lg text-gray-400 mb-6">View and manage customer bookings</p>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by booking code or movie..."
              className="w-full py-2 px-4 bg-gray-700 rounded-md"
            />
          </div>

          {/* Bookings Table */}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left text-gray-400">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4">Booking Code</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking['Booking ID']} className="border-b border-gray-700">
                    <td className="py-3 px-4">{booking['Booking ID']}</td>
                    <td className="py-3 px-4">{booking['Payment Method']}</td>
                    <td className="py-3 px-4">{booking['Amount Paid'].toLocaleString()} ₫</td>
                    <td className="py-3 px-4">{new Date(booking['Date & Time']).toLocaleString()}</td>
                    <td className="py-3 px-4">{getCustomerName(booking['User ID'])}</td>
                    <td className="py-3 px-4">
                      <Link href={`/staff/bookings/${booking['Booking ID']}`}>
                        <button className="text-blue-400 hover:underline">View</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingsPage;
