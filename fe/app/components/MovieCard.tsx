"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Movie {
  movie_id: number;
  title: string;
  image_url: string;
  plot_description: string;
  duration: number;
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    if (!movie?.movie_id) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reviews/${movie.movie_id}/stats`
    )
      .then((res) => res.json())
      .then((data) => {
        setRating(Number(data.average_rating) || 0);
      })
      .catch(() => setRating(0));
  }, [movie.movie_id]);

  return (
    <Link href={`/movie/${movie.movie_id}`}>
      <div className="group cursor-pointer bg-[#141414] rounded-xl overflow-hidden shadow-lg hover:scale-105 transition transform duration-300">
        
        {/* IMAGE */}
        <div className="w-full h-60 overflow-hidden">
          <img
            src={movie.image_url || "/placeholder-movie.jpg"}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          <h3 className="text-xl font-bold group-hover:text-red-500 transition">
            {movie.title}
          </h3>

          <p className="text-gray-400 mt-2 text-sm line-clamp-2">
            {movie.plot_description}
          </p>

          <div className="flex items-center justify-between mt-3 text-sm text-gray-300">
            <span>⭐ {rating > 0 ? rating.toFixed(1) : "N/A"}</span>
            <span>{movie.duration}m</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
