'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const BookingsPage = () => {
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [selectedBooking, setSelectedBooking] = useState<any>(null); // Store selected booking

  // Sample booking data
  const bookings = [
    {
      bookingCode: 'CGV2024031501',
      movie: 'Dune: Part Two',
      theater: 'CGV Vincom Center - Cinema 2 - IMAX',
      dateTime: '2024-03-15 19:30',
      seats: ['F5', 'F6'],
      combos: ['Couple Combo x1'],
      totalAmount: 439000,
      status: 'upcoming',
    },
    {
      bookingCode: 'CGV2024030801',
      movie: 'Kung Fu Panda 4',
      theater: 'Galaxy Cinema - Room 1',
      dateTime: '2024-03-08 11:30',
      seats: ['D3', 'D4', 'D5'],
      combos: ['Single Combo x1'],
      totalAmount: 444000,
      status: 'completed',
    },
  ];

  const openModal = (booking: any) => {
    setSelectedBooking(booking); // Set the selected booking data
    setShowModal(true); // Show the modal
  };

  const closeModal = () => {
    setShowModal(false); // Close the modal
  };

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
                <button className="w-full py-2 px-4 bg-red-600 rounded-md">Bookings</button>
              </Link>
            </li>
            <li>
              <Link href="/staff/customers">
                <button className="w-full py-2 px-4 bg-gray-700 rounded-md">Customers</button>
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
        <h1 className="text-3xl font-semibold mb-6">Bookings</h1>
        <p className="text-lg text-gray-400 mb-6">View and manage customer bookings</p>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by booking code or movie..."
            className="w-full py-2 px-4 bg-gray-700 rounded-md"
          />
        </div>

        {/* Bookings Table */}
        <table className="w-full text-left text-gray-400">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4">Booking Code</th>
              <th className="py-3 px-4">Movie</th>
              <th className="py-3 px-4">Theater</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="py-3 px-4">{booking.bookingCode}</td>
                <td className="py-3 px-4">{booking.movie}</td>
                <td className="py-3 px-4">{booking.theater}</td>
                <td className="py-3 px-4">{booking.dateTime}</td>
                <td className="py-3 px-4">{booking.totalAmount.toLocaleString()} ₫</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-md ${
                      booking.status === 'completed' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => openModal(booking)} // Open the modal when clicked
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <i className="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Booking Details */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-semibold mb-4">Booking Details</h2>

            {/* Booking Information */}
            <div className="mb-4">
              <strong>Booking Code:</strong> <span className="text-red-500">{selectedBooking.bookingCode}</span>
            </div>
            <div className="mb-4">
              <strong>Movie & Showtime:</strong>
              <p>{selectedBooking.movie} - {selectedBooking.theater} - {selectedBooking.dateTime}</p>
            </div>
            <div className="mb-4">
              <strong>Seats:</strong> {selectedBooking.seats.join(', ')}
            </div>
            <div className="mb-4">
              <strong>Combos:</strong> {selectedBooking.combos.join(', ')}
            </div>
            <div className="mb-4">
              <strong>Total Amount:</strong> {selectedBooking.totalAmount.toLocaleString()} ₫
            </div>

            {/* Close Modal Button */}
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .modal-content {
          background-color: #222;
          padding: 30px;
          border-radius: 8px;
          width: 400px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: white;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          background-color: #333;
          color: white;
          border: 1px solid #555;
          border-radius: 8px;
        }

        .bg-gray-700 {
          background-color: #333;
        }

        .bg-red-600 {
          background-color: #e53e3e;
        }

        .bg-gray-500 {
          background-color: #6b7280;
        }

        .text-white {
          color: white;
        }

        .rounded-lg {
          border-radius: 8px;
        }

        .movie-table {
          width: 100%;
          border-collapse: collapse;
        }

        .movie-table th,
        .movie-table td {
          padding: 10px;
          border-bottom: 1px solid #333;
        }

        .movie-table th {
          background-color: #222;
        }

        .movie-table tbody tr:hover {
          background-color: #222;
        }
      `}</style>
    </div>
  );
};

export default BookingsPage;
