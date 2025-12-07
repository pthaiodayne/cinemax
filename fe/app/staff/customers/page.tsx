'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Staff');
  const [userRole, setUserRole] = useState('staff');

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

  // Fetch bookings and extract unique customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${API_BASE}/bookings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await res.json();
        const bookings = data.bookings || [];

        // Group bookings by customer email
        const customerMap = new Map();
        bookings.forEach((booking: any) => {
          const email = booking.customer_email;
          if (!customerMap.has(email)) {
            customerMap.set(email, {
              customerId: booking.user_id,
              name: booking.customer_name,
              email: booking.customer_email,
              phone: booking.customer_phone || 'N/A',
              bookings: 0,
              totalSpent: 0
            });
          }
          const customer = customerMap.get(email);
          customer.bookings += 1;
          customer.totalSpent += Number(booking.amount_paid || 0);
        });

        setCustomers(Array.from(customerMap.values()));
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
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
          <Link href="/staff/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">⌂</span>
            <span>Dashboard</span>
          </Link>

          <Link href="/staff/bookings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🎟️</span>
            <span>Bookings</span>
          </Link>

          <Link href="/staff/customers" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-600 text-sm font-medium">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/20 text-xs">👥</span>
            <span>Customers</span>
          </Link>

          <Link href="/staff/movies" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🎬</span>
            <span>Movies</span>
          </Link>

          <Link href="/staff/showtimes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🕐</span>
            <span>Showtimes</span>
          </Link>

          <Link href="/staff/combos" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#181818]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">🍿</span>
            <span>Combos</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-400 mt-1">View customer booking statistics</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name or email..."
            className="w-full py-2 px-4 bg-gray-700 rounded-md"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        {/* Customers Table */}
        {loading ? (
          <div className="text-gray-400">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-gray-400">No customers found</div>
        ) : (
          <table className="w-full text-left text-gray-400">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Bookings</th>
                <th className="py-3 px-4">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.email} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="py-3 px-4">{customer.name}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{customer.email}</div>
                    <div className="text-xs text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="py-3 px-4">{customer.bookings} bookings</td>
                  <td className="py-3 px-4">{customer.totalSpent.toLocaleString('vi-VN')} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default CustomersPage;
