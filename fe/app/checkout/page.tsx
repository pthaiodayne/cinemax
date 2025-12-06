'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SelectedCombo {
  combo_id: number;
  name: string;
  price: number;
  quantity: number;
}

type PaymentMethod = 'card' | 'momo' | 'cash';

const CheckoutPage: React.FC = () => {
  const searchParams = useSearchParams();

  // ====== LẤY DATA TỪ /combo ======
  const movieId = searchParams.get('movieId') || '';
  const movieTitle = searchParams.get('movieTitle') || 'Movie';
  const moviePoster = searchParams.get('moviePoster') || '';
  const theaterId = searchParams.get('theaterId') || '';
  const theaterName = searchParams.get('theaterName') || 'Theater';
  const screenNumber = searchParams.get('screenNumber') || '1';
  const date = searchParams.get('date') || '';
  const startTime = searchParams.get('startTime') || '';
  const format = searchParams.get('format') || '2D';

  const seatsParam = searchParams.get('seats') || '';
  const seats = useMemo(
    () => seatsParam.split(',').filter(Boolean),
    [seatsParam]
  );

  const vipSeatsParam = searchParams.get('vipSeats') || '';
  const normalSeatsParam = searchParams.get('normalSeats') || '';
  const vipCountParam = searchParams.get('vipCount') || '0';
  const normalCountParam = searchParams.get('normalCount') || '0';

  const totalSeatsParam = searchParams.get('totalSeats') || '0';
  const totalSeats = Number(totalSeatsParam || '0');

  const ticketTotalParam = searchParams.get('ticketTotal') || '0';
  const ticketTotal = Number(ticketTotalParam || '0');

  const combosParam = searchParams.get('combos') || '[]';
  const combosTotalParam = searchParams.get('combosTotal') || '0';
  const grandTotalParam = searchParams.get('grandTotal') || '0';

  let combos: SelectedCombo[] = [];
  try {
    const parsed = JSON.parse(combosParam);
    if (Array.isArray(parsed)) {
      combos = parsed.map((c: any) => ({
        combo_id: Number(c.combo_id),
        name: String(c.name),
        price: Number(c.price),
        quantity: Number(c.quantity),
      }));
    }
  } catch {
    combos = [];
  }

  const combosTotalFromCombos = useMemo(
    () => combos.reduce((sum, c) => sum + c.price * c.quantity, 0),
    [combos]
  );

  const combosTotal =
    combosTotalFromCombos > 0
      ? combosTotalFromCombos
      : Number(combosTotalParam || '0');

  const bookingFee = 0; // nếu sau này muốn phí đặt vé thì sửa chỗ này
  const grandTotal =
    Number(grandTotalParam || '0') || ticketTotal + combosTotal + bookingFee;

  const formattedDateTime =
    date && startTime
      ? `${date} • ${startTime.slice(0, 5)}`
      : date || startTime;

  // ====== PAYMENT METHOD STATE ======
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  const paymentLabel: Record<PaymentMethod, string> = {
    card: 'Credit / Debit Card',
    momo: 'Momo E-Wallet',
    cash: 'Pay at Counter',
  };

  // ====== RENDER ======
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* TOP BAR */}
      <div className="w-full bg-black border-b border-[#222]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Back to Combo: giữ hết query */}
          <Link
            href={{
              pathname: '/combo',
              query: {
                movieId,
                movieTitle,
                moviePoster,
                theaterId,
                theaterName,
                screenNumber,
                date,
                startTime,
                format,
                seats: seatsParam,
                vipSeats: vipSeatsParam,
                normalSeats: normalSeatsParam,
                vipCount: vipCountParam,
                normalCount: normalCountParam,
                totalSeats: String(totalSeats),
                ticketTotal: String(ticketTotal),
                combos: combosParam,
                combosTotal: String(combosTotal),
                grandTotal: String(grandTotal),
              },
            }}
            className="text-sm text-gray-300 hover:text-white flex items-center gap-2"
          >
            <span className="text-lg">{'←'}</span>
            <span>Back to Combos</span>
          </Link>
          <div className="font-semibold tracking-wide text-orange-500">
            CINEMAX
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-3xl font-semibold mb-4">Checkout</h1>
        <p className="text-sm text-gray-400 mb-6">
          Review your tickets and combos before confirming your booking.
        </p>

        {/* MOVIE CARD */}
        <section className="bg-[#101010] border border-[#222] rounded-2xl p-5 flex gap-4 items-center">
          <div className="w-20 h-28 rounded-md overflow-hidden bg-gradient-to-b from-gray-700 to-black flex items-center justify-center">
            {moviePoster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={moviePoster}
                alt={movieTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500">No Poster</span>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">{movieTitle}</h2>
            <p className="text-xs text-gray-300 mb-1">
              {theaterName} - Cinema {screenNumber}
            </p>
            <p className="text-xs text-gray-400 mb-1">{formattedDateTime}</p>
            <span className="inline-block mt-1 px-2 py-1 rounded-full bg-yellow-500 text-black text-[10px] font-semibold">
              {format}
            </span>
          </div>
        </section>

        {/* TICKETS CARD */}
        <section className="bg-[#101010] border border-[#222] rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-3">Tickets</h3>
          <p className="text-sm mb-1">
            Seats:{' '}
            <span className="font-semibold">
              {seats.length > 0 ? seats.join(', ') : 'No seats selected'}
            </span>
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Standard: {normalCountParam} | VIP: {vipCountParam} | Total:{' '}
            {totalSeats}
          </p>
          <p className="text-sm font-semibold text-yellow-400">
            {ticketTotal.toLocaleString('vi-VN')} ₫
          </p>
        </section>

        {/* SNACKS & DRINKS CARD */}
        <section className="bg-[#101010] border border-[#222] rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-3">Snacks & Drinks</h3>

          {combos.length === 0 ? (
            <p className="text-sm text-gray-400">
              No combos selected. You can still go back and add snacks.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {combos.map((c) => (
                <div
                  key={c.combo_id}
                  className="flex items-center justify-between"
                >
                  <span>
                    {c.name} x{c.quantity}
                  </span>
                  <span className="text-yellow-400">
                    {(c.price * c.quantity).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-[#333] flex justify-between text-sm font-semibold">
                <span>Total combos</span>
                <span className="text-yellow-400">
                  {combosTotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
          )}
        </section>

        {/* PAYMENT METHOD CARD – phần bị mất giờ thêm lại */}
        <section className="bg-[#101010] border border-[#222] rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-3">Payment Method</h3>

          <div className="flex flex-col gap-3 text-sm">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
                paymentMethod === 'card'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-[#181818] border-[#333] text-gray-200 hover:border-red-600'
              }`}
            >
              <span>{paymentLabel.card}</span>
              {paymentMethod === 'card' && <span>✓</span>}
            </button>

            <button
              onClick={() => setPaymentMethod('momo')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
                paymentMethod === 'momo'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-[#181818] border-[#333] text-gray-200 hover:border-red-600'
              }`}
            >
              <span>{paymentLabel.momo}</span>
              {paymentMethod === 'momo' && <span>✓</span>}
            </button>

            <button
              onClick={() => setPaymentMethod('cash')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
                paymentMethod === 'cash'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-[#181818] border-[#333] text-gray-200 hover:border-red-600'
              }`}
            >
              <span>{paymentLabel.cash}</span>
              {paymentMethod === 'cash' && <span>✓</span>}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Selected method:{' '}
            <span className="font-semibold text-gray-200">
              {paymentLabel[paymentMethod]}
            </span>
          </p>
        </section>

        {/* ORDER SUMMARY */}
        <section className="bg-[#101010] border border-[#222] rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tickets</span>
              <span>{ticketTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between">
              <span>Combos</span>
              <span>{combosTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Booking fee</span>
              <span>{bookingFee.toLocaleString('vi-VN')} ₫</span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#333] flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-yellow-400">
                {grandTotal.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          <button
            className="mt-6 w-full px-6 py-3 bg-red-600 rounded-lg text-white font-semibold hover:opacity-90 transition"
            // TODO: sau này gắn API create booking + thanh toán
          >
            Confirm Booking
          </button>
        </section>
      </div>
    </div>
  );
};

export default CheckoutPage;
