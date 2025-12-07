'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StaffSidebar from '../../components/StaffSidebar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffName, setStaffName] = useState('Staff');
  const [staffRole, setStaffRole] = useState('staff');

  // Get staff info from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.userType !== 'staff') {
          window.location.href = '/';
          return;
        }
        setStaffName(user.name || 'Staff');
        setStaffRole(user.role || 'staff');
      } catch (e) {
        console.error('Error parsing user data:', e);
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

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

  {/*
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
  */}
  // Customer data is already included in bookings response
  // No need to fetch separately

  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) =>
    booking.booking_id?.toString().includes(searchQuery) ||
    booking.date_time?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the user name for a specific user ID from the customer data
  const getCustomerName = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <StaffSidebar activePage="bookings" />

      {/* Main Content */}
      <main className="flex-1 ml-64 px-8 py-6 bg-[#050505] min-h-screen">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold">Bookings</h1>
              <p className="text-lg text-gray-400 mt-2">View and manage customer bookings</p>
            </div>
            <Link href="/staff/create-booking">
              <button className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
                <span>+</span>
                <span>Create Booking</span>
              </button>
            </Link>
          </div>

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
                  <tr key={booking.booking_id} className="border-b border-gray-700">
                    <td className="py-3 px-4">{booking.booking_id}</td>
                    <td className="py-3 px-4">{booking.payment_method}</td>
                    <td className="py-3 px-4">{Number(booking.amount_paid || 0).toLocaleString()} ₫</td>
                    <td className="py-3 px-4">{booking.date_time ? new Date(booking.date_time).toLocaleString('vi-VN') : 'N/A'}</td>
                    <td className="py-3 px-4">{booking.customer_name || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      <Link href={`/ticket/${booking.booking_id}`}>
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
