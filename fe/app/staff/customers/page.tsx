'use client';

import React, { useState, useEffect } from 'react';
import StaffSidebar from '../../components/StaffSidebar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('Staff');
  const [userRole, setUserRole] = useState('staff');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.userType !== 'staff') {
          window.location.href = '/';
          return;
        }
        setUserName(user.name || 'Staff');
        setUserRole(user.role || 'staff');
      } catch (e) {
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

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
      <StaffSidebar activePage="customers" />

      {/* Main Content */}
      <main className="flex-1 ml-64 px-8 py-6 bg-[#050505] min-h-screen">
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
