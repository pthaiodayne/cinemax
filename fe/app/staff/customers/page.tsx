'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch customer data from the backend API
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
        setCustomers(data.customers);
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
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Link href="/staff/customers">
                <button className="w-full py-2 px-4 bg-red-600 rounded-md">Customers</button>
              </Link>
            </li>
            {/* Other nav items */}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#141414] text-white p-6">
        <h1 className="text-3xl font-semibold mb-6">Customers</h1>
        <p className="text-lg text-gray-400 mb-6">Manage customer accounts and loyalty</p>

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

        {/* Customers Table */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full text-left text-gray-400">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.customerId} className="border-b border-gray-700">
                  <td className="py-3 px-4">{customer.name}</td>
                  <td className="py-3 px-4">
                    <div>{customer.email}</div>
                    <div>{customer.phone}</div>
                  </td>
                  <td className="py-3 px-4">{customer.bookings} bookings</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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

        .sidebar nav ul {
          list-style: none;
          padding: 0;
        }

        .sidebar nav ul li {
          margin-bottom: 10px;
        }

        .sidebar nav ul li a {
          color: white;
          text-decoration: none;
          font-size: 18px;
          display: block;
          padding: 10px;
          border-radius: 5px;
        }

        .sidebar nav ul li a:hover {
          background-color: #333;
        }

        .customers-table {
          width: 100%;
          border-collapse: collapse;
        }

        .customers-table th,
        .customers-table td {
          padding: 10px;
          border-bottom: 1px solid #333;
        }

        .customers-table th {
          background-color: #222;
        }

        .customers-table tbody tr:hover {
          background-color: #222;
        }

        .bg-yellow-500 {
          background-color: #fbbf24;
        }

        .bg-gray-500 {
          background-color: #6b7280;
        }

        .bg-brown-500 {
          background-color: #9e7b44;
        }

        .bg-purple-500 {
          background-color: #6b4f96;
        }
      `}</style>
    </div>
  );
};

export default CustomersPage;
