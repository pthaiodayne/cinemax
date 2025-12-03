"use client";

import { useState } from "react";

export default function ReviewForm({ movieId }: { movieId: string }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(10);

  async function submit() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${movieId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: "Anonymous User",
        review_text: text,
        rating
      })
    });

    alert("Submitted!");
    setText("");
    setRating(10);
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
          {Array.from({ length: 10 }).map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}/10</option>
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
