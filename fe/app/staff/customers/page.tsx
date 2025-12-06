'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const CustomersPage = () => {
  // Sample customer data
  const customers = [
    {
      customerId: 'NVA',
      name: 'Nguyen Van A',
      email: 'nguyenvana@email.com',
      phone: '0901234567',
      membership: 'Gold',
      points: 2500,
      totalSpent: 1250000,
      bookings: 12,
    },
    {
      customerId: 'TTB',
      name: 'Tran Thi B',
      email: 'tranthitb@email.com',
      phone: '0912345678',
      membership: 'Silver',
      points: 1200,
      totalSpent: 680000,
      bookings: 7,
    },
    {
      customerId: 'LVC',
      name: 'Le Van C',
      email: 'levanc@email.com',
      phone: '0923456789',
      membership: 'Bronze',
      points: 450,
      totalSpent: 285000,
      bookings: 3,
    },
    {
      customerId: 'PTD',
      name: 'Pham Thi D',
      email: 'phamthid@email.com',
      phone: '0934567890',
      membership: 'Platinum',
      points: 5200,
      totalSpent: 3450000,
      bookings: 28,
    },
  ];

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Handle input change for search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
              <Link href="/staff/movies">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Movies</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/showtimes">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Showtimes</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/bookings">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Bookings</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/customers">
                <button className="w-full py-2 px-4 bg-red-600 rounded-md">Customers</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/combos">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Combos</button>
              </Link>
            </li>
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
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
            className="w-full py-2 px-4 bg-gray-700 rounded-md"
          />
        </div>

        {/* Customers Table */}
        <table className="w-full text-left text-gray-400">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Membership</th>
              <th className="py-3 px-4">Points</th>
              <th className="py-3 px-4">Total Spent</th>
              <th className="py-3 px-4">Bookings</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.customerId} className="border-b border-gray-700">
                <td className="py-3 px-4">{customer.name}</td>
                <td className="py-3 px-4">{customer.email} <br /> {customer.phone}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-md ${
                      customer.membership === 'Gold'
                        ? 'bg-yellow-500'
                        : customer.membership === 'Silver'
                        ? 'bg-gray-500'
                        : customer.membership === 'Bronze'
                        ? 'bg-brown-500'
                        : 'bg-purple-500'
                    }`}
                  >
                    {customer.membership}
                  </span>
                </td>
                <td className="py-3 px-4">{customer.points}</td>
                <td className="py-3 px-4">{customer.totalSpent.toLocaleString()} ₫</td>
                <td className="py-3 px-4">{customer.bookings} bookings</td>
              </tr>
            ))}
          </tbody>
        </table>
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
