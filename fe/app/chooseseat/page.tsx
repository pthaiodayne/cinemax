'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

type SeatType = 'normal' | 'vip' | '';

interface SeatFromApi {
  seat_number: string;   // ví dụ "A1", "B10"
  seat_type: string;     // "normal" | "vip"
}

const ChooseSeatPage: React.FC = () => {
  const searchParams = useSearchParams();

  // ----- info từ query (được truyền từ trang showtime) -----
  const movieId = searchParams.get('movieId');
  const movieTitle = searchParams.get('movieTitle') || 'Movie';
  const moviePoster = searchParams.get('moviePoster') || '';
  const theaterName = searchParams.get('theaterName') || 'Theater';
  const theaterId = searchParams.get('theaterId'); // dùng để gọi API ghế
  const screenNumber = searchParams.get('screenNumber') || '1';
  const date = searchParams.get('date') || '';
  const startTime = searchParams.get('startTime') || '';
  const endTime = searchParams.get('endTime') || '';
  const format = searchParams.get('format') || '2D';

  // ----- khởi tạo selectedSeats từ query (khi quay về từ combo) -----
  const seatsFromQuery = searchParams.get('seats') || '';
  const [selectedSeats, setSelectedSeats] = useState<string[]>(() =>
    seatsFromQuery ? seatsFromQuery.split(',').filter(Boolean) : []
  );

  // seatCode -> seatType (normal / vip)
  const [seatTypes, setSeatTypes] = useState<Record<string, SeatType>>({});
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatError, setSeatError] = useState<string | null>(null);

  // layout ghế: 5 hàng A–E, mỗi hàng 10 ghế = 50 ghế
  const seatRows = [
    { row: 'A', seats: ['1','2','3','4','5','6','7','8','9','10'] },
    { row: 'B', seats: ['1','2','3','4','5','6','7','8','9','10'] },
    { row: 'C', seats: ['1','2','3','4','5','6','7','8','9','10'] },
    { row: 'D', seats: ['1','2','3','4','5','6','7','8','9','10'] },
    { row: 'E', seats: ['1','2','3','4','5','6','7','8','9','10'] },
  ];

  // ---------- GỌI API GHẾ ----------
  useEffect(() => {
    if (!theaterId || !screenNumber) return;

    const fetchSeats = async () => {
      try {
        setLoadingSeats(true);
        setSeatError(null);

        // Fetch seat types
        const url = `${API_BASE}/seats/auditorium?theater_id=${theaterId}&screen_number=${screenNumber}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch seats: ${res.status}`);
        }

        const json = await res.json();
        const seats: SeatFromApi[] = Array.isArray(json) ? json : json.seats || [];

        const map: Record<string, SeatType> = {};
        seats.forEach((s) => {
          const code = String(s.seat_number); // ví dụ "A1", "B10"
          const type = (s.seat_type || '').toLowerCase();
          if (type === 'vip' || type === 'normal') {
            map[code] = type as SeatType;
          } else {
            map[code] = '';
          }
        });

        setSeatTypes(map);

        // Fetch booked seats for this showtime
        if (date && startTime && endTime) {
          const bookedUrl = `${API_BASE}/seats/booked?theater_id=${theaterId}&screen_number=${screenNumber}&date=${date}&start_time=${startTime}&end_time=${endTime}`;
          const bookedRes = await fetch(bookedUrl);
          
          if (bookedRes.ok) {
            const bookedJson = await bookedRes.json();
            const booked = bookedJson.bookedSeats || [];
            setBookedSeats(booked.map((s: any) => String(s.seat_number || s)));
          }
        }
      } catch (err: any) {
        console.error(err);
        setSeatError(err.message || 'Failed to load seats');
      } finally {
        setLoadingSeats(false);
      }
    };

    fetchSeats();
  }, [theaterId, screenNumber, date, startTime, endTime]);

  // ---------- CHỌN GHẾ ----------
  const toggleSeatSelection = (seatCode: string) => {
    // Không cho chọn ghế đã đặt
    if (bookedSeats.includes(seatCode)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatCode)
        ? prev.filter((s) => s !== seatCode)
        : [...prev, seatCode]
    );
  };

  // màu ghế dựa vào loại trong DB + trạng thái selected + booked
  const getSeatColor = (seatCode: string) => {
    if (bookedSeats.includes(seatCode)) return 'bg-gray-900 text-gray-600 cursor-not-allowed';
    if (selectedSeats.includes(seatCode)) return 'bg-red-600';

    const type = seatTypes[seatCode];
    if (type === 'vip') return 'bg-yellow-500 text-black';

    // normal hoặc chưa rõ -> standard
    return 'bg-gray-700';
  };

  const formattedDateTime =
    date && startTime
      ? `${date} • ${startTime.slice(0, 5)}`
      : date || startTime;

  // ---------- TÍNH TOÁN SỐ LƯỢNG VIP / THƯỜNG ----------
  const { vipSeats, normalSeats } = useMemo(() => {
    const vip: string[] = [];
    const normal: string[] = [];

    selectedSeats.forEach((code) => {
      const type = seatTypes[code];
      if (type === 'vip') vip.push(code);
      else normal.push(code); // coi tất cả cái còn lại là thường
    });

    return { vipSeats: vip, normalSeats: normal };
  }, [selectedSeats, seatTypes]);

  const vipCount = vipSeats.length;
  const normalCount = normalSeats.length;
  const totalSeats = selectedSeats.length;

  // GIÁ VÉ THEO DB (ví dụ: normal=100k, vip=120k)
  const NORMAL_PRICE = 100000;
  const VIP_PRICE = 120000;

  const ticketTotal =
    normalCount * NORMAL_PRICE + vipCount * VIP_PRICE;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* top bar */}
      <div className="w-full bg-black border-b border-[#222]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href={{
              pathname: '/chooseshowtime',
              query: movieId ? { movieId } : {},
            }}
            className="text-sm text-gray-300 hover:text-white flex items-center gap-2"
          >
            <span className="text-lg">{'←'}</span>
            <span>Back to Showtimes</span>
          </Link>
          <div className="font-semibold tracking-wide text-orange-500">
            CINEMAX
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Movie info */}
        <div className="flex gap-6 mb-8">
          <div className="w-32 h-44 rounded-md overflow-hidden bg-gradient-to-b from-gray-700 to-black flex items-center justify-center">
            {moviePoster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={moviePoster}
                alt={movieTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500">No Poster</span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">{movieTitle}</h1>
              <p className="text-sm text-gray-300 mb-1">
                {theaterName} - Cinema {screenNumber}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                {formattedDateTime}
              </p>
              <span className="inline-block px-2 py-1 rounded-full bg-yellow-500 text-black text-xs font-semibold">
                {format}
              </span>
            </div>
          </div>
        </div>

        {/* trạng thái load ghế */}
        {loadingSeats && (
          <p className="text-center text-sm text-gray-400 mb-4">
            Loading seats...
          </p>
        )}
        {seatError && (
          <p className="text-center text-sm text-red-500 mb-4">
            {seatError}
          </p>
        )}

        {/* SCREEN label */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center px-6 py-1 rounded-full bg-red-600 text-sm font-semibold">
            SCREEN
          </div>
          <div className="h-1 mt-3 bg-red-600 w-1/2 mx-auto" />
        </div>

        {/* Seating chart */}
        <div className="flex flex-col items-center">
          {seatRows.map((row) => (
            <div key={row.row} className="flex items-center justify-center mb-2">
              <span className="w-6 text-right mr-2 text-sm text-gray-300">
                {row.row}
              </span>
              {row.seats.map((seat) => {
                const seatCode = `${row.row}${seat}`;
                return (
                  <button
                    key={seatCode}
                    onClick={() => toggleSeatSelection(seatCode)}
                    disabled={bookedSeats.includes(seatCode)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 m-1 rounded-md text-xs sm:text-sm flex items-center justify-center ${getSeatColor(
                      seatCode
                    )} hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {seat}
                  </button>
                );
              })}
              <span className="w-6 ml-2 text-sm text-gray-300">
                {row.row}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-col items-center text-xs text-gray-300 gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-md bg-gray-700" />
              <span>Standard</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-md bg-yellow-500" />
              <span>VIP</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-md bg-red-600" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-md bg-gray-900" />
              <span>Booked</span>
            </div>
          </div>
        </div>

        {/* Selected seats + Continue */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
          <div>
            <p className="text-gray-300">
              Ghế đã chọn:{' '}
              {totalSeats === 0 ? (
                <span className="text-gray-500">Chưa chọn</span>
              ) : (
                <span className="font-semibold">
                  {selectedSeats.join(', ')}
                </span>
              )}
            </p>
            <p className="text-gray-300 mt-1">
              Standard: <span className="font-semibold">{normalCount}</span> |{' '}
              VIP: <span className="font-semibold">{vipCount}</span> | Tổng:{' '}
              <span className="font-semibold">{totalSeats}</span>
            </p>
            <p className="text-gray-300 mt-1">
              Tiền vé:{' '}
              <span className="font-semibold">
                {ticketTotal.toLocaleString('vi-VN')} ₫
              </span>
            </p>
          </div>

          <Link
            href={{
              pathname: '/combo',
              query: {
                // showtime info
                movieId: movieId || '',
                movieTitle,
                moviePoster,
                theaterId: theaterId || '',
                theaterName,
                screenNumber,
                date,
                startTime,
                endTime,
                format,

                // seat info
                seats: selectedSeats.join(','),       // tất cả ghế
                vipSeats: vipSeats.join(','),         // chỉ ghế VIP
                normalSeats: normalSeats.join(','),   // chỉ ghế thường
                vipCount: String(vipCount),
                normalCount: String(normalCount),
                totalSeats: String(totalSeats),

                // tổng tiền vé
                ticketTotal: String(ticketTotal),
              },
            }}
          >
            <button
              className="px-6 py-3 bg-red-600 rounded-lg text-white font-semibold hover:opacity-90 transition disabled:bg-red-900 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={totalSeats === 0}
            >
              Continue ({totalSeats} seats)
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseSeatPage;
