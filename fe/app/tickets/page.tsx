"use client";

import { useEffect, useState } from "react";
import BookingCard from "../components/BookingCard";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("You must login to view your bookings");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/bookings/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`//, ✅✅✅ BẮT BUỘC
            },
          }
        );

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();

        // Backend trả: { count, bookings }
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("FETCH BOOKINGS ERROR:", err);
        alert("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">

      <div className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">My Tickets</h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-gray-400">
            You have no bookings yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((b: any) => (
              <BookingCard key={b.booking_id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
