'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StaffSidebarProps {
  activePage: 'dashboard' | 'bookings' | 'customers' | 'movies' | 'showtimes' | 'combos' | 'create-booking';
}

export default function StaffSidebar({ activePage }: StaffSidebarProps) {
  const [staffName, setStaffName] = useState('Staff');
  const [staffRole, setStaffRole] = useState('staff');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setStaffName(user.name || 'Staff');
        setStaffRole(user.role || 'staff');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const isActive = (page: string) => activePage === page;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0b0b0b] border-r border-[#242424] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#242424]">
        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-red-600 text-sm font-semibold">
          {staffName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-lg font-semibold leading-none">{staffName}</div>
          <div className="text-xs text-gray-400 mt-1 capitalize">{staffRole}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link
          href="/staff/dashboard"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            isActive('dashboard')
              ? 'bg-red-600 font-medium'
              : 'text-gray-300 hover:bg-[#181818]'
          }`}
        >
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs ${
            isActive('dashboard') ? 'bg-black/20' : 'bg-[#191919]'
          }`}>
            ⌂
          </span>
          <span>Dashboard</span>
        </Link>

        <Link
          href="/staff/bookings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            isActive('bookings')
              ? 'bg-red-600 font-medium'
              : 'text-gray-300 hover:bg-[#181818]'
          }`}
        >
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs ${
            isActive('bookings') ? 'bg-black/20' : 'bg-[#191919]'
          }`}>
            🎟️
          </span>
          <span>Bookings</span>
        </Link>

        <Link
          href="/staff/customers"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            isActive('customers')
              ? 'bg-red-600 font-medium'
              : 'text-gray-300 hover:bg-[#181818]'
          }`}
        >
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs ${
            isActive('customers') ? 'bg-black/20' : 'bg-[#191919]'
          }`}>
            👥
          </span>
          <span>Customers</span>
        </Link>

        <Link
          href="/staff/movies"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            isActive('movies')
              ? 'bg-red-600 font-medium'
              : 'text-gray-300 hover:bg-[#181818]'
          }`}
        >
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs ${
            isActive('movies') ? 'bg-black/20' : 'bg-[#191919]'
          }`}>
            🎬
          </span>
          <span>Movies</span>
        </Link>

        <Link
          href="/staff/showtimes"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            isActive('showtimes')
              ? 'bg-red-600 font-medium'
              : 'text-gray-300 hover:bg-[#181818]'
          }`}
        >
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs ${
            isActive('showtimes') ? 'bg-black/20' : 'bg-[#191919]'
          }`}>
            🕐
          </span>
          <span>Showtimes</span>
        </Link>

        <Link
          href="/staff/combos"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            isActive('combos')
              ? 'bg-red-600 font-medium'
              : 'text-gray-300 hover:bg-[#181818]'
          }`}
        >
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs ${
            isActive('combos') ? 'bg-black/20' : 'bg-[#191919]'
          }`}>
            🍿
          </span>
          <span>Combos</span>
        </Link>
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-[#242424]">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-red-600 hover:text-white transition w-full"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#191919] text-xs">
            🚪
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
