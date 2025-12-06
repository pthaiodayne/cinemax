'use client';

import React from 'react';
import Link from 'next/link';

const BookingConfirmPage = () => {
  // Sample data for the booking confirmation page
  const orderSummary = {
    bookingCode: 'CGV4824981206',
    movie: 'Godzilla x Kong',
    theater: 'CGV Vincom Center',
    cinema: 'Cinema 3',
    date: '2024-03-15',
    time: '12:00',
    seats: ['E6'],
    totalAmount: 120000,
  };

  return (
    <div className="container mx-auto p-6 bg-[#141414] text-white">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/checkout" passHref>
          <button className="flex items-center space-x-2 bg-gray-700 text-white py-2 px-6 rounded-md">
            <span className="text-xl">{'<'}</span>
            <span>Back to Checkout</span>
          </button>
        </Link>
      </div>

      <h1 className="text-3xl font-semibold mb-6">Booking Confirmed!</h1>
      <p className="text-lg text-gray-400 mb-6">Your tickets have been sent to your email</p>

      {/* Booking Info Section */}
      <section className="bg-black p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-semibold text-white">Booking Code</span>
            <span className="bg-red-600 text-white py-1 px-3 rounded-md text-lg">{orderSummary.bookingCode}</span>
          </div>
          <span className="bg-green-500 text-white py-1 px-3 rounded-md text-lg">Paid via QR Pay</span>
        </div>

        <div className="flex items-center mb-4">
          <img src="/path/to/movie-poster.jpg" alt={orderSummary.movie} className="w-32 h-48 object-cover mr-6" />
          <div className="movie-info">
            <h4 className="text-xl font-bold">{orderSummary.movie}</h4>
            <p className="text-sm text-gray-400">{orderSummary.theater} - {orderSummary.cinema}</p>
            <p className="text-sm text-gray-400">{orderSummary.date} | {orderSummary.time}</p>
            <p className="text-sm text-gray-400">Seats: {orderSummary.seats.join(', ')}</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <img src="/path/to/qr-code.png" alt="QR Code" className="mx-auto mb-4" />
          <p className="text-lg text-white">Scan this QR code at the theater</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-xl text-white">Total Paid</span>
          <span className="text-xl text-white">{orderSummary.totalAmount.toLocaleString()} ₫</span>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex justify-between mb-6">
        <Link href="/download">
          <button className="px-6 py-3 bg-red-600 rounded-lg text-white font-semibold hover:opacity-90 transition">
            Download Ticket
          </button>
        </Link>
        <button className="px-6 py-3 bg-gray-700 rounded-lg text-white font-semibold hover:opacity-90 transition">
          Share
        </button>
      </div>

      <div className="text-center">
        <Link href="/mytickets" passHref>
          <button className="text-lg text-gray-400 hover:text-white">View All My Tickets</button>
        </Link>
      </div>

      <div className="text-center mt-4">
        <Link href="/" passHref>
          <button className="text-lg text-gray-400 hover:text-white">Back to Home</button>
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmPage;
