"use client";

import Image from "next/image";

export default function MovieDetailModal({ movie, onClose }: any) {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center items-center animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#111] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl hover:text-red-400 transition"
        >
          ×
        </button>

        {/* Banner Image */}
        <div className="w-full h-72 relative">
          <Image
            src={movie.image_url}
            alt={movie.title}
            fill
            className="object-cover opacity-70"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h1 className="text-4xl font-semibold">{movie.title}</h1>

          <div className="flex gap-5 text-gray-400 mt-3 text-sm">
            <span>⭐ {movie.rating || "8.0"}</span>
            <span>⏱ {movie.duration} min</span>
            <span>📅 {movie.release_date?.split("T")[0]}</span>
          </div>

          <p className="mt-4 text-gray-300 leading-relaxed">
            {movie.plot_description}
          </p>

          <div className="flex gap-4 mt-6">
            <button className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold">
              Book Tickets
            </button>

            <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold">
              Watch Trailer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
