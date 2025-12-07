"use client";
import Link from "next/link";

export default function BookingCard({ booking }: any) {
  if (!booking?.booking_id) {
    console.error("❌ Missing booking_id:", booking);
    return null;
  }

  return (
    <Link href={`/tickets/${booking.booking_id}`}>
      <div className="bg-[#111] p-5 rounded-xl border border-white/10 hover:border-red-500 transition cursor-pointer">
        <div className="flex justify-between mb-2">
          <b>Booking #{booking.booking_id}</b>
          <span className={booking.amount_paid > 0 ? "text-green-400" : "text-yellow-400"}>
            {booking.amount_paid > 0 ? "Paid" : "Unpaid"}
          </span>
        </div>

        <p className="text-sm text-gray-400">
          Tickets: {booking.ticket_count}
        </p>

        <p className="text-sm text-gray-400">
          Total: {Number(booking.amount_paid).toLocaleString("vi-VN")} ₫
        </p>

        <p className="text-xs text-gray-500 mt-2">
          {new Date(booking.date_time).toLocaleString("vi-VN")}
        </p>
      </div>
    </Link>
  );
}
