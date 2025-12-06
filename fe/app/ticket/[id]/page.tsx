"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function TicketDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch booking");
        return res.json();
      })
      .then(data => {
        setBooking(data.booking);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">
        Booking not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold mb-6">
          Booking #{booking.booking_id}
        </h1>

        <div className="bg-[#111] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Tickets</h2>

          {booking.tickets.map((t: any, i: number) => (
            <div key={i} className="border-b border-white/10 py-2 text-gray-300">
               {t.movie_title} |  {t.seat_number} |  {t.theater_name}
            </div>
          ))}
        </div>

        {booking.combos?.length > 0 && (
          <div className="bg-[#111] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Combos</h2>

            {booking.combos.map((c: any, i: number) => (
              <div key={i} className="text-gray-300">
                {c.name} × {c.count}
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#111] rounded-xl p-6">
          <p>
             Total Paid:{" "}
            {Number(booking.amount_paid).toLocaleString("vi-VN")} ₫
          </p>
          <p>
             Status: {booking.amount_paid > 0 ? "Paid" : "Unpaid"}
          </p>
        </div>
      </div>
    </div>
  );
}
