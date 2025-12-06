import Navbar from "../../components/Navbar";
import ReviewForm from "./ReviewForm";
import Link from "next/link";

async function getMovie(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${id}`, {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  return data.movie;
}

async function getReviews(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${id}`);
  const data = await res.json();
  return data.reviews || [];
}

export default async function MovieDetailPage({ params }: any) {
  const { id } = await params;

  const movie = await getMovie(id);
  const reviews = await getReviews(id);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <Navbar />

      {/* NÚT BACK VỀ HOMEPAGE */}
      <div className="w-full bg-[#0b0b0b]">
        <div className="max-w-6xl mx-auto px-10 pt-6">
          <Link
            href="/"   // 👈 trang Neon Racer của bạn
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <span className="text-lg">←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="relative w-full py-10 px-10 flex gap-10 bg-gradient-to-b from-black/70 to-black">
        <div className="w-[350px] h-[500px] rounded-xl overflow-hidden shadow-lg">
          <img
            src={movie.image_url}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center max-w-3xl">
          <h1 className="text-6xl font-extrabold">{movie.title}</h1>

          <div className="flex gap-6 mt-4 text-lg text-gray-300">
            <span>⭐ {movie.rating}/10</span>
            <span>⏱ {movie.duration}m</span>
            <span>📅 {movie.release_date?.slice(0, 10)}</span>
          </div>

          <p className="mt-6 text-lg text-gray-300">
            {movie.plot_description}
          </p>

          {/* NÚT CHOOSE SHOWTIME */}
          <Link
            href={{
              pathname: "/chooseshowtime",
              query: {
                movieId: String(id),
                movieTitle: movie.title,
                moviePoster: movie.image_url,
              },
            }}
            className="mt-8 inline-flex items-center justify-center px-10 py-4 bg-red-600 hover:bg-red-700 text-lg font-semibold rounded-xl shadow-lg shadow-red-800/40 transition"
          >
            Choose Showtime
          </Link>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="px-10 py-16">
        <h2 className="text-3xl font-bold mb-6">Reviews</h2>

        <div className="flex flex-col gap-5 mb-10">
          {reviews.map((rev: any, idx: number) => (
            <div
              key={idx}
              className="bg-[#111] p-6 rounded-xl border border-white/10"
            >
              <div className="flex justify-between">
                <b>{rev.user}</b>
                <span className="text-yellow-300">⭐ {rev.rating}/10</span>
              </div>
              <p className="mt-3 text-gray-300">{rev.review_text}</p>
            </div>
          ))}
        </div>

        <ReviewForm movieId={params.id} />
      </section>
    </div>
  );
}
