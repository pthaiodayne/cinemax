'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';

interface Showtime {
  id: number;

  movie_id?: number;
  movieId?: number;

  theater_id?: number;
  theaterId?: number;

  screen_number?: number;

  start_time?: string;
  startTime?: string;

  end_time?: string;
  date?: string | Date;

  format?: string; // nếu sau này BE có cột format thì xài được
  auditorium_format?: string; 
  theater_name?: string;
  theaterName?: string;

  location?: string;
  theater_location?: string;
  theaterLocation?: string;
}

interface Theater {
  id: number;
  theater_id?: number;
  name?: string;
  theater_name?: string;
  address?: string;
  district?: string;
  city?: string;
}

interface Movie {
  movie_id: number;
  title: string;
  image_url?: string;
  formats?: string[];
}

// Chuẩn hóa mọi kiểu date về 'YYYY-MM-DD'
const normalizeDateKey = (value: string | Date) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    // fallback: nếu backend trả chuỗi '2024-11-21' thì cứ cắt 10 ký tự đầu
    return String(value).slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
};

const ChooseShowtimePage: React.FC = () => {
  const searchParams = useSearchParams();

  // /chooseshowtime?movieId=1
  const movieIdParam = searchParams.get('movieId');
  const movieId = movieIdParam ? Number(movieIdParam) : NaN;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [errorMovie, setErrorMovie] = useState<string | null>(null);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [selectedTheaterId, setSelectedTheaterId] = useState<number | null>(
    null // null = All Theaters
  );
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);

  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingTheaters, setLoadingTheaters] = useState(false);

  const [errorShowtimes, setErrorShowtimes] = useState<string | null>(null);
  const [errorDates, setErrorDates] = useState<string | null>(null);
  const [errorTheaters, setErrorTheaters] = useState<string | null>(null);

  // Nếu không có movieId hợp lệ -> báo lỗi luôn
  if (!movieIdParam || isNaN(movieId)) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-red-400 text-sm">
          Thiếu <code>movieId</code> trong URL.
          Gọi dạng: <code>/chooseshowtime?movieId=1</code>.
        </p>
      </div>
    );
  }

  // -------- FETCH MOVIE (DB) --------
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoadingMovie(true);
        setErrorMovie(null);

        const res = await fetch(`${API_BASE}/movies/${movieId}`);
        if (!res.ok) throw new Error('Movie not found');

        const data = await res.json();
        setMovie(data.movie as Movie);
      } catch (err: any) {
        console.error(err);
        setErrorMovie(err.message || 'Failed to fetch movie');
      } finally {
        setLoadingMovie(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  // -------- FETCH DATES (dùng /showtimes?movie_id=...) --------
  useEffect(() => {
    const fetchDates = async () => {
      try {
        setLoadingDates(true);
        setErrorDates(null);

        const res = await fetch(
          `${API_BASE}/showtimes?movie_id=${movieId}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch dates: ${res.status}`);
        }

        const json = await res.json();
        const list: Showtime[] = Array.isArray(json)
          ? json
          : json.showtimes || [];

        const dateSet = new Set<string>();
        list.forEach((st) => {
          if (st.date) {
            dateSet.add(normalizeDateKey(st.date));
          }
        });

        const dates = Array.from(dateSet).sort(); // đúng những ngày có trong DB
        setAvailableDates(dates);

        if (!selectedDate && dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      } catch (err: any) {
        console.error(err);
        setErrorDates(err.message || 'Failed to fetch dates');
      } finally {
        setLoadingDates(false);
      }
    };

    fetchDates();
  }, [movieId]); // chỉ phụ thuộc movieId

  // -------- FETCH THEATERS (dùng route /showtimes/theaters) --------
  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        setLoadingTheaters(true);
        setErrorTheaters(null);

        const res = await fetch(`${API_BASE}/showtimes/theaters`);

        if (!res.ok) {
          throw new Error(`Failed to fetch theaters: ${res.status}`);
        }

        const json = await res.json();
        const list: Theater[] = Array.isArray(json)
          ? json
          : json.theaters || [];

        setTheaters(list);
      } catch (err: any) {
        console.error(err);
        setErrorTheaters(err.message || 'Failed to fetch theaters');
      } finally {
        setLoadingTheaters(false);
      }
    };

    fetchTheaters();
  }, []);

  // -------- FETCH SHOWTIMES CHO NGÀY ĐANG CHỌN (cũng dùng /showtimes) --------
  useEffect(() => {
    if (!selectedDate) return;

    const fetchShowtimes = async () => {
      try {
        setLoadingShowtimes(true);
        setErrorShowtimes(null);

        // selectedDate đã là 'YYYY-MM-DD'
        const url = `${API_BASE}/showtimes?movie_id=${movieId}&date=${selectedDate}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch showtimes: ${res.status}`);
        }

        const json = await res.json();
        const list: Showtime[] = Array.isArray(json)
          ? json
          : json.showtimes || [];

        setShowtimes(list);
      } catch (err: any) {
        console.error(err);
        setErrorShowtimes(err.message || 'Failed to fetch showtimes');
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchShowtimes();
  }, [selectedDate, movieId]);

  // -------- HELPERS --------
  const theaterDisplayName = (t: Theater) =>
    t.name || t.theater_name || `Theater #${(t.theater_id || t.id) ?? '?'}`;

  const theaterLocation = (t: Theater) => {
    if (t.address) return t.address;
    const parts = [t.district, t.city].filter(Boolean);
    return parts.join(', ');
  };

  const theaterInfoMap = useMemo(() => {
    const map = new Map<number, { name: string; location: string }>();
    theaters.forEach((t) => {
      const id = (t.theater_id ?? t.id) as number;
      if (!id) return;
      map.set(id, {
        name: theaterDisplayName(t),
        location: theaterLocation(t),
      });
    });
    return map;
  }, [theaters]);

  const groupedShowtimes = useMemo(() => {
    const groups = new Map<
      number,
      { theaterId: number; showtimes: Showtime[] }
    >();

    showtimes.forEach((st) => {
      const theaterId =
        (st.theater_id as number | undefined) ??
        (st.theaterId as number | undefined);
      if (!theaterId) return;

      if (!groups.has(theaterId)) {
        groups.set(theaterId, { theaterId, showtimes: [] });
      }
      groups.get(theaterId)!.showtimes.push(st);
    });

    const arr = Array.from(groups.values());
    arr.sort((a, b) => {
      const infoA = theaterInfoMap.get(a.theaterId);
      const infoB = theaterInfoMap.get(b.theaterId);
      return (infoA?.name || '').localeCompare(infoB?.name || '');
    });

    return arr;
  }, [showtimes, theaterInfoMap]);

  const theaterButtons = useMemo(() => {
    const buttons: { id: number | null; label: string }[] = [
      { id: null, label: 'All Theaters' },
    ];
    theaters.forEach((t) => {
      const id = (t.theater_id ?? t.id) as number;
      if (!id) return;
      buttons.push({ id, label: theaterDisplayName(t) });
    });
    return buttons;
  }, [theaters]);

  const formatTimeLabel = (st: Showtime) => {
    const start = st.start_time || st.startTime || '09:00:00';
    const rawDate = st.date || selectedDate || '';
    const dateKey = normalizeDateKey(rawDate as any);
    const dt = new Date(`${dateKey}T${start}`);
    return dt.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLabel = (st: Showtime) =>
    st.auditorium_format || st.format || '2D';

  const cinemaLabel = (st: Showtime) =>
    `Cinema ${st.screen_number ?? 1}`;

  const formatDateDisplay = (value: string) => {
    const dt = new Date(value);
    const day = dt.toLocaleDateString('en-GB', { weekday: 'short' });
    const date = dt.toLocaleDateString('en-GB', { day: '2-digit' });
    const month = dt.toLocaleDateString('en-GB', { month: 'short' });
    return { day, date, month };
  };

  const movieFormats =
    movie?.formats && movie.formats.length > 0
      ? movie.formats
      : ['2D', '3D', 'IMAX'];

  const friendlySelectedDate =
    selectedDate &&
    new Date(selectedDate).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  // -------- RENDER --------
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Top bar */}
      <div className="w-full bg-black border-b border-[#222]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href={`/movie/${movieIdParam}`}
            className="text-sm text-gray-300 hover:text-white flex items-center gap-2"
          >
            <span className="text-lg">{'←'}</span>
            <span>Back to Movie</span>
          </Link>
          <div className="font-semibold tracking-wide text-orange-500">
            CINEMAX
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Movie header */}
        <div className="flex gap-6 mb-10">
          <div className="w-32 h-44 bg-gradient-to-b from-gray-700 to-black rounded-md shadow-lg overflow-hidden flex items-center justify-center">
            {movie?.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={movie.image_url}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500">No Poster</span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              {loadingMovie ? (
                <p className="text-sm text-gray-400">Loading movie...</p>
              ) : errorMovie ? (
                <p className="text-sm text-red-500">{errorMovie}</p>
              ) : movie ? (
                <>
                  <h1 className="text-3xl font-semibold mb-3">
                    {movie.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {movieFormats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2 py-1 rounded-full bg-yellow-500 text-black font-semibold"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Select Date */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-500">📅</span>
            <h3 className="text-lg font-semibold">Select Date</h3>
          </div>

          {loadingDates && (
            <p className="text-sm text-gray-400">Loading dates...</p>
          )}
          {errorDates && (
            <p className="text-sm text-red-500 mb-2">{errorDates}</p>
          )}

          <div className="flex flex-wrap gap-3">
            {availableDates.map((value) => {
              const isActive = selectedDate === value;
              const { day, date, month } = formatDateDisplay(value);
              return (
                <button
                  key={value}
                  onClick={() => setSelectedDate(value)}
                  className={`w-20 h-24 flex flex-col items-center justify-center rounded-xl border text-sm transition-colors ${
                    isActive
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-[#181818] border-[#333] text-gray-300 hover:border-red-600'
                  }`}
                >
                  <span className="text-xs text-gray-400">{day}</span>
                  <span className="text-2xl font-bold">{date}</span>
                  <span className="text-xs text-gray-400">{month}</span>
                </button>
              );
            })}
            {!loadingDates &&
              !errorDates &&
              availableDates.length === 0 && (
                <p className="text-sm text-gray-400">
                  Không có suất chiếu nào trong database cho phim này.
                </p>
              )}
          </div>
        </section>

        {/* Select Theater */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-500">📍</span>
            <h3 className="text-lg font-semibold">Select Theater</h3>
          </div>

          {loadingTheaters && (
            <p className="text-sm text-gray-400">Loading theaters...</p>
          )}
          {errorTheaters && (
            <p className="text-sm text-red-500 mb-2">{errorTheaters}</p>
          )}

          <div className="flex flex-wrap gap-3">
            {[
              { id: null as number | null, label: 'All Theaters' },
              ...theaters.map((t) => ({
                id: (t.theater_id ?? t.id) as number,
                label: theaterDisplayName(t),
              })),
            ].map((btn) => {
              const isActive = selectedTheaterId === btn.id;
              return (
                <button
                  key={btn.id ?? 'all'}
                  onClick={() => setSelectedTheaterId(btn.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                    isActive
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-[#181818] border-[#333] text-gray-300 hover:border-red-600'
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Available Showtimes */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-500">⏱️</span>
            <h3 className="text-lg font-semibold">Available Showtimes</h3>
          </div>

          {loadingShowtimes && (
            <p className="text-sm text-gray-400">Loading showtimes...</p>
          )}
          {errorShowtimes && (
            <p className="text-sm text-red-500 mb-2">{errorShowtimes}</p>
          )}
          {!loadingShowtimes &&
            !errorShowtimes &&
            groupedShowtimes.length === 0 &&
            selectedDate && (
              <p className="text-sm text-gray-400">
                Không có suất chiếu cho ngày {friendlySelectedDate}.
              </p>
            )}

          <div className="space-y-6">
            {groupedShowtimes
              .filter(
                (group) =>
                  selectedTheaterId === null ||
                  group.theaterId === selectedTheaterId
              )
              .map((group) => {
                const info = theaterInfoMap.get(group.theaterId);
                const theaterName =
                  info?.name || `Theater #${group.theaterId}`;
                const location = info?.location || '';

                return (
                  <div
                    key={group.theaterId}
                    className="bg-[#121212] border border-[#222] rounded-2xl px-6 py-5"
                  >
                    <div className="mb-4">
                      <h4 className="text-base font-semibold">
                        {theaterName}
                      </h4>
                      {location && (
                        <p className="text-xs text-gray-400">{location}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {group.showtimes.map((st, index) => {
                          const timeLabel = formatTimeLabel(st);
                          const format = formatLabel(st);
                          const cinema = cinemaLabel(st);
                          const dateKey = normalizeDateKey(st.date || selectedDate || '');
                          const movieForSeat = st.movie_id ?? st.movieId ?? movieId;

                          const key =
                            st.id ??
                            `${group.theaterId}-${st.screen_number}-${st.start_time}-${dateKey}-${index}`;

                          return (
                            <Link
                              key={key}
                              href={{
                                pathname: '/chooseseat',
                                query: {
                                  // showtime info để cho trang seat dùng
                                  movieId: movieForSeat,
                                  movieTitle: movie?.title || '',
                                  moviePoster: movie?.image_url || '',
                                  theaterId: (st.theater_id ?? group.theaterId)?.toString(),
                                  theaterName: theaterName, // lấy từ theaterInfoMap như bạn đang có
                                  screenNumber: (st.screen_number ?? 1).toString(),
                                  date: dateKey,
                                  startTime: st.start_time || st.startTime || '',
                                  format, // 2D / 3D / IMAX
                                },
                              }}
                              className="w-40 bg-[#1b1b1b] border border-[#333] rounded-xl px-4 py-3 text-sm hover:border-red-500 transition-colors"
                            >
                              <div className="text-lg font-semibold">{timeLabel}</div>
                              <div className="text-[10px] text-gray-400">{dateKey}</div>
                              <div className="mt-2 text-xs text-gray-300">{format}</div>
                              <div className="text-xs text-gray-400">{cinema}</div>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChooseShowtimePage;
