'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ComboFromApi {
  combo_id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface ComboItem extends ComboFromApi {
  quantity: number;
  description?: string;
  items?: string[];
}

type SelectedComboFromQuery = {
  combo_id: string;
  quantity: number;
  name?: string;
  price?: number;
};

const ComboPage: React.FC = () => {
  const searchParams = useSearchParams();

  // ====== LẤY DATA TỪ /chooseseat / checkout ======
  const ticketTotal = Number(searchParams.get('ticketTotal') || '0');

  const movieId = searchParams.get('movieId') || '';
  const movieTitle = searchParams.get('movieTitle') || 'Movie';
  const moviePoster = searchParams.get('moviePoster') || '';
  const theaterId = searchParams.get('theaterId') || '';
  const theaterName = searchParams.get('theaterName') || 'Theater';
  const screenNumber = searchParams.get('screenNumber') || '1';
  const date = searchParams.get('date') || '';
  const startTime = searchParams.get('startTime') || '';
  const endTime = searchParams.get('endTime') || '';
  const format = searchParams.get('format') || '2D';

  const seatsParam = searchParams.get('seats') || '';
  const seats = useMemo(
    () => seatsParam.split(',').filter(Boolean),
    [seatsParam]
  );

  const totalSeatsParam = searchParams.get('totalSeats') || '';
  const totalSeats =
    Number(totalSeatsParam || '0') || (seats.length > 0 ? seats.length : 0);

  const vipSeatsParam = searchParams.get('vipSeats') || '';
  const normalSeatsParam = searchParams.get('normalSeats') || '';
  const vipCountParam = searchParams.get('vipCount') || '0';
  const normalCountParam = searchParams.get('normalCount') || '0';

  const formattedDateTime =
    date && startTime
      ? `${date} • ${startTime.slice(0, 5)}`
      : date || startTime;

  // ====== ĐỌC COMBOS ĐÃ CHỌN TỪ QUERY (KHI QUAY LẠI TỪ CHECKOUT) ======
  const selectedCombosParam = searchParams.get('combos') || '';
  const initialSelectedCombos = useMemo<SelectedComboFromQuery[]>(() => {
    if (!selectedCombosParam) return [];
    try {
      const parsed = JSON.parse(selectedCombosParam);
      if (!Array.isArray(parsed)) return [];
      return parsed as SelectedComboFromQuery[];
    } catch {
      return [];
    }
  }, [selectedCombosParam]);

  // ====== STATE COMBO (TỪ BACKEND) ======
  const [combos, setCombos] = useState<ComboItem[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [errorCombos, setErrorCombos] = useState<string | null>(null);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoadingCombos(true);
        setErrorCombos(null);

        const res = await fetch(`${API_BASE}/combos`);
        if (!res.ok) {
          throw new Error(`Failed to fetch combos: ${res.status}`);
        }

        const data = await res.json();
        const list: ComboFromApi[] = Array.isArray(data)
          ? data
          : data.combos || [];

        // map thêm description + items (mock theo tên) + quantity = 0
        const mappedBase: ComboItem[] = list.map((c) => {
          let description = '';
          let items: string[] = [];

          switch (c.name) {
            case 'Single Combo':
              description = 'Perfect for solo movie goers';
              items = ['1 Medium Popcorn', '1 Medium Drink'];
              break;
            case 'Couple Combo':
              description = 'Share the moment together';
              items = ['1 Large Popcorn', '2 Medium Drinks'];
              break;
            case 'Family Combo':
              description = 'Fun for the whole family';
              items = ['2 Large Popcorns', '4 Medium Drinks', '1 Nachos'];
              break;
            case 'Premium Snack Box':
              description = 'Elevated cinema experience';
              items = ['1 Caramel Popcorn', '2 Premium Drinks', '1 Hot Dog'];
              break;
            default:
              description = 'Cinema combo';
              items = [];
              break;
          }

          return {
            ...c,
            quantity: 0,
            description,
            items,
          };
        });

        // nếu có dữ liệu combos từ query => gán lại quantity tương ứng
        const mappedWithQty: ComboItem[] = mappedBase.map((combo) => {
          const found = initialSelectedCombos.find(
            (sc) => sc.combo_id === combo.combo_id
          );
          if (!found) return combo;
          return {
            ...combo,
            quantity: found.quantity,
          };
        });

        setCombos(mappedWithQty);
      } catch (err: any) {
        console.error(err);
        setErrorCombos(err.message || 'Failed to load combos');
      } finally {
        setLoadingCombos(false);
      }
    };

    fetchCombos();
  }, [initialSelectedCombos]);

  // ====== HANDLERS / TÍNH TỔNG ======
  const handleQuantityChange = (index: number, change: number) => {
    setCombos((prev) =>
      prev.map((combo, i) => {
        if (i !== index) return combo;
        const nextQty = Math.max(0, combo.quantity + change);
        return { ...combo, quantity: nextQty };
      })
    );
  };

  const combosTotal = useMemo(
    () => combos.reduce((sum, c) => sum + c.price * c.quantity, 0),
    [combos]
  );

  const grandTotal = ticketTotal + combosTotal;

  const selectedSummary = useMemo(() => {
    const list = combos
      .filter((c) => c.quantity > 0)
      .map((c) => `${c.name} x${c.quantity}`);
    if (list.length === 0) return 'No combos selected';
    return list.join(', ');
  }, [combos]);

  const selectedCombosJson = useMemo(
    () =>
      JSON.stringify(
        combos
          .filter((c) => c.quantity > 0)
          .map((c) => ({
            combo_id: c.combo_id,
            name: c.name,
            price: c.price,
            quantity: c.quantity,
          }))
      ),
    [combos]
  );

  // ====== RENDER ======
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* TOP BAR */}
      <div className="w-full bg-black border-b border-[#222]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Back: quay lại trang seat + giữ state (dùng query) */}
          <Link
            href={{
              pathname: '/chooseseat',
              query: {
                movieId,
                movieTitle,
                moviePoster,
                theaterId,
                theaterName,
                screenNumber,
                date,
                startTime,
                endTime,
                format,

                seats: seatsParam,
                vipSeats: vipSeatsParam,
                normalSeats: normalSeatsParam,
                vipCount: vipCountParam,
                normalCount: normalCountParam,
                totalSeats: String(totalSeats),
                ticketTotal: String(ticketTotal),
              },
            }}
            className="text-sm text-gray-300 hover:text-white flex items-center gap-2"
          >
            <span className="text-lg">{'←'}</span>
            <span>Back to Seats</span>
          </Link>
          <div className="font-semibold tracking-wide text-orange-500">
            CINEMAX
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Title */}
          <h1 className="text-3xl font-semibold mb-2">Add Snacks & Drinks</h1>
          <p className="text-sm text-gray-400 mb-6">
            Enhance your cinema experience with our delicious combos.
          </p>

          {/* MOVIE INFO + TICKET PRICE CARD */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#101010] border border-[#222] rounded-2xl px-6 py-5 mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-28 rounded-md overflow-hidden bg-gradient-to-b from-gray-700 to-black flex items-center justify-center">
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
              <div>
                <h2 className="text-xl font-semibold mb-1">{movieTitle}</h2>
                <p className="text-xs text-gray-300 mb-1">
                  {theaterName} - Cinema {screenNumber}
                </p>
                <p className="text-xs text-gray-400 mb-1">
                  {formattedDateTime}
                </p>
                <p className="text-xs text-gray-400">
                  Seats:{' '}
                  {seats.length > 0 ? seats.join(', ') : 'No seats selected'}
                </p>
                <span className="inline-block mt-2 px-2 py-1 rounded-full bg-yellow-500 text-black text-[10px] font-semibold">
                  {format}
                </span>
              </div>
            </div>

            <div className="md:text-right bg-black/60 border border-[#333] rounded-xl px-4 py-3 self-stretch flex md:block items-center justify-between gap-2">
              <div className="text-xs uppercase text-gray-400 tracking-wide">
                Tickets
              </div>
              <div className="text-lg font-semibold text-yellow-400">
                {ticketTotal.toLocaleString('vi-VN')} ₫
              </div>
            </div>
          </div>

          {/* COMBO SECTION */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Select Combo</h3>

            {loadingCombos && (
              <p className="text-sm text-gray-400 mb-4">Loading combos...</p>
            )}
            {errorCombos && (
              <p className="text-sm text-red-500 mb-4">{errorCombos}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {combos.map((combo, index) => (
                <div
                  key={combo.combo_id}
                  className="bg-[#141414] border border-[#222] rounded-2xl overflow-hidden shadow-md flex flex-col"
                >
                  {combo.image_url && (
                    <div className="h-32 w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={combo.image_url}
                        alt={combo.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="text-base font-semibold mb-1">
                      {combo.name}
                    </h4>
                    {combo.description && (
                      <p className="text-xs text-gray-400 mb-2">
                        {combo.description}
                      </p>
                    )}
                    {combo.items && combo.items.length > 0 && (
                      <ul className="text-xs text-gray-400 mb-3 space-y-1">
                        {combo.items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#222]">
                      <span className="text-sm font-semibold text-yellow-400">
                        {combo.price.toLocaleString('vi-VN')} ₫
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(index, -1);
                          }}
                          className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a]"
                        >
                          –
                        </button>
                        <span>{combo.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(index, 1);
                          }}
                          className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="w-full bg-black border-t border-[#222]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-xs text-gray-400">{selectedSummary}</div>
          <div className="flex items-center gap-6 justify-between md:justify-end">
            <div className="text-lg font-semibold text-yellow-400">
              {grandTotal.toLocaleString('vi-VN')} ₫
            </div>
            <Link
              href={{
                pathname: '/checkout',
                query: {
                  movieId,
                  movieTitle,
                  moviePoster,
                  theaterId,
                  theaterName,
                  screenNumber,
                  date,
                  startTime,
                  endTime,
                  format,
                  seats: seatsParam,
                  vipSeats: vipSeatsParam,
                  normalSeats: normalSeatsParam,
                  vipCount: vipCountParam,
                  normalCount: normalCountParam,
                  totalSeats: String(totalSeats),
                  ticketTotal: String(ticketTotal),

                  combos: selectedCombosJson,
                  combosTotal: String(combosTotal),
                  grandTotal: String(grandTotal),
                },
              }}
            >
              <button className="px-6 py-3 bg-red-600 rounded-lg text-white font-semibold hover:opacity-90 transition">
                Continue to Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboPage;
