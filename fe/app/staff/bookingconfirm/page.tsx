'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const BookingConfirmPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch booking');

      const data = await res.json();
      setBookingDetails(data.booking);
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      alert('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setConfirming(true);
      const token = localStorage.getItem('token');

      if (!token) {
        alert('You are not logged in');
        return;
      }

      console.log('Confirming payment for booking:', bookingId);
      console.log('Payment method:', paymentMethod);

      const res = await fetch(`${API_BASE}/bookings/${bookingId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_status: 'paid'
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Payment confirmation failed:', errorText);
        throw new Error(errorText || 'Failed to confirm payment');
      }

      const data = await res.json();
      console.log('Payment confirmed:', data);
      
      alert('Payment confirmed successfully!');
      router.push('/staff/dashboard');
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      alert(err.message || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="text-lg">Loading booking details...</div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <div className="text-lg mb-4">Booking not found</div>
          <Link href="/staff/dashboard">
            <button className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-2">Booking Created Successfully</h1>
          <p className="text-lg text-gray-400">Please confirm payment method</p>
        </div>

        {/* Booking Info Section */}
        <section className="bg-[#0b0b0b] border border-[#242424] rounded-lg p-6 mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-white">Booking ID:</span>
              <span className="bg-red-600 text-white py-1 px-3 rounded-md text-lg">
                #{bookingDetails.booking_id}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 pb-6 border-b border-[#242424]">
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
            <div className="space-y-2 text-gray-300">
              <p>Name: {bookingDetails.customer_name}</p>
              <p>Email: {bookingDetails.customer_email}</p>
              <p>Phone: {bookingDetails.customer_phone}</p>
            </div>
          </div>

          {/* Movie & Theater Info */}
          <div className="mb-6 pb-6 border-b border-[#242424]">
            <h3 className="text-lg font-semibold mb-3">Booking Details</h3>
            <div className="space-y-2 text-gray-300">
              {bookingDetails.tickets && bookingDetails.tickets[0] && (
                <>
                  <p className="font-semibold text-white">{bookingDetails.tickets[0].movie_title}</p>
                  <p>{bookingDetails.tickets[0].theater_name}</p>
                  <p>Date: {bookingDetails.tickets[0].date}</p>
                  <p>Time: {bookingDetails.tickets[0].start_time} - {bookingDetails.tickets[0].end_time}</p>
                  <p>Seats: {bookingDetails.tickets.map((t: any) => t.seat_number).join(', ')}</p>
                </>
              )}
            </div>
          </div>

          {/* Combos */}
          {bookingDetails.combos && bookingDetails.combos.length > 0 && (
            <div className="mb-6 pb-6 border-b border-[#242424]">
              <h3 className="text-lg font-semibold mb-3">Combos</h3>
              <div className="space-y-2 text-gray-300">
                {bookingDetails.combos.map((combo: any, idx: number) => (
                  <p key={idx}>
                    {combo.name} x{combo.count} - {(combo.price * combo.count).toLocaleString()} ₫
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Total Amount */}
          <div className="flex justify-between items-center text-xl font-semibold">
            <span>Total Amount</span>
            <span className="text-red-500">{bookingDetails.amount_paid.toLocaleString()} ₫</span>
          </div>
        </section>

        {/* Payment Method Selection */}
        <section className="bg-[#0b0b0b] border border-[#242424] rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-[#141414] rounded-lg cursor-pointer hover:bg-[#1a1a1a]">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <span>Cash</span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-[#141414] rounded-lg cursor-pointer hover:bg-[#1a1a1a]">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <span>Card</span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-[#141414] rounded-lg cursor-pointer hover:bg-[#1a1a1a]">
              <input
                type="radio"
                name="payment"
                value="momo"
                checked={paymentMethod === 'momo'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <span>MoMo</span>
            </label>
            <label className="flex items-center gap-3 p-4 bg-[#141414] rounded-lg cursor-pointer hover:bg-[#1a1a1a]">
              <input
                type="radio"
                name="payment"
                value="zalopay"
                checked={paymentMethod === 'zalopay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <span>ZaloPay</span>
            </label>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/staff/dashboard" className="flex-1">
            <button className="w-full px-6 py-3 bg-gray-700 rounded-lg text-white font-semibold hover:bg-gray-600 transition">
              Cancel
            </button>
          </Link>
          <button
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="flex-1 px-6 py-3 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {confirming ? 'Confirming...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmPage;
