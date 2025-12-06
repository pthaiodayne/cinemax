"use client";

import { useState } from "react";

export default function ReviewForm({ movieId }: { movieId: string }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  async function submit() {
    const token = localStorage.getItem("token"); // ✅ lấy token auth

    if (!token) {
      alert("You must login to submit a review");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reviews`, // ✅ ĐÚNG ROUTE
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ BẮT BUỘC
        },
        body: JSON.stringify({
          movie_id: Number(movieId),   // ✅ đúng với MySQL
          review_text: text,
          stars: rating               // ✅ backend dùng stars
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Submit failed");
      return;
    }

    alert("Submitted!");
    setText("");
    setRating(5);
    location.reload(); // ✅ reload để load review mới
  }

  return (
    <div className="bg-[#111] p-6 rounded-xl border border-white/10 max-w-xl">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-3 bg-black border border-white/20 rounded text-white"
        placeholder="Share your thoughts..."
      />

      <div className="mt-4">
        <label className="mr-2">Rating:</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="bg-black border p-2 rounded"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}/5
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={submit}
        className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg"
      >
        Submit Review
      </button>
    </div>
  );
}
