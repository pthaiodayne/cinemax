import MovieCard from "./components/MovieCard";
import SectionTitle from "./components/SectionTitle";
import Navbar from "./components/Navbar";

async function getMovies() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies`, {
    next: { revalidate: 60 }
  });
  const data = await res.json();
  return data.movies;
}

export default async function HomePage() {
  const movies = await getMovies();
  const featured = movies[0];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">

      <Navbar />

      {/* HERO */}
      <section
        className="relative w-full h-[85vh] flex items-end pb-28 px-10"
        style={{
          backgroundImage: `url(${featured.image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b99] to-transparent"></div>

        <div className="relative z-10 max-w-3xl">
          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
            ★ Featured
          </span>

          <h1 className="text-7xl font-extrabold leading-tight mt-4">
            {featured.title.split(" ").slice(0, 2).join(" ")}:
            <br /> {featured.title.split(" ").slice(2).join(" ")}
          </h1>

          {/* Info */}
          <div className="flex items-center gap-6 mt-5 text-gray-300 text-lg">
            <span>⭐ {featured.rating || 8.8}</span>
            <span>⏱ {featured.duration}m</span>
            <span>📅 {featured.release_date?.slice(0, 10)}</span>
          </div>

          {/* Description */}
          <p className="mt-6 text-gray-300 text-lg line-clamp-4">
            {featured.plot_description}
          </p>

          {/* Tags */}
          <div className="flex gap-3 mt-5">
            <span className="px-3 py-1 text-xs bg-white/10 rounded-lg">
              {featured.age_restrict}
            </span>
            <span className="px-3 py-1 text-xs bg-white/10 rounded-lg">
              {featured.production_company}
            </span>
          </div>

          {/* CTA */}
          <div className="flex gap-4 mt-8">
            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-semibold hover:opacity-90 transition">
              Book Tickets
            </button>
            <button className="px-6 py-3 border border-gray-400 rounded-lg hover:bg-gray-700 transition">
              ▶ Watch Trailer
            </button>
          </div>
        </div>
      </section>

      {/* MOVIES */}
      <section className="px-10 py-16">
        <SectionTitle
          title="Movies"
          subtitle="Discover the latest blockbusters and upcoming releases"
        />

        {/* Filter */}
        <div className="flex gap-3 mb-10">
          <button className="px-4 py-2 bg-red-600 rounded-lg text-sm">
            Now Showing
          </button>
          <button className="px-4 py-2 bg-[#1d1d1d] rounded-lg text-sm">
            Coming Soon
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {movies.map((movie: any) => (
            <MovieCard key={movie.movie_id} movie={movie} />
          ))}
        </div>
      </section>

      {/* SPECIAL OFFERS */}
      <section className="px-10 py-20">
        <h2 className="text-4xl font-bold mb-6">Special Offers</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Offer 1 */}
          <div className="p-8 rounded-xl bg-gradient-to-br from-red-900 to-yellow-700 text-white">
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
              LIMITED TIME
            </span>
            <h3 className="text-2xl font-semibold mt-4">Member Monday</h3>
            <p className="mt-2 text-gray-200">
              50% off all tickets every Monday for members!
            </p>
            <button className="mt-5 px-5 py-2 bg-white text-black rounded-lg font-semibold hover:opacity-80">
              Learn More
            </button>
          </div>

          {/* Offer 2 */}
          <div className="p-8 rounded-xl bg-gradient-to-br from-yellow-700 to-red-800 text-white">
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
              NEW
            </span>
            <h3 className="text-2xl font-semibold mt-4">IMAX Experience</h3>
            <p className="mt-2 text-gray-200">
              Book IMAX tickets and get free combo upgrade.
            </p>
            <button className="mt-5 px-5 py-2 bg-white text-black rounded-lg font-semibold hover:opacity-80">
              Book Now
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
