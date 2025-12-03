"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  function active(route: string) {
    return path === route ? "text-red-500" : "text-gray-300";
  }

  return (
    <nav className="w-full bg-[#0d0d0d]/80 backdrop-blur-md border-b border-[#222] px-6 py-4 flex items-center justify-between fixed top-0 left-0 z-50">
      
      {/* Logo */}
      <Link href="/" className="text-3xl font-bold tracking-wide">
        <span className="text-red-500">CINE</span>MAX
      </Link>

      {/* Menu */}
      <div className="flex items-center gap-8 text-lg">
        <Link href="/movies" className={active("/movies")}>
          Movies
        </Link>

        <Link href="/tickets" className={active("/tickets")}>
          My Tickets
        </Link>

        <Link href="/staff" className={active("/staff")}>
          Staff
        </Link>
      </div>

      {/* Actions: search + sign in */}
      <div className="flex items-center gap-4">
        <button className="text-gray-300 hover:text-red-500 transition">
          <i className="fas fa-search"></i>
        </button>

        <Link
          href="/login"
          className="px-4 py-2 rounded-lg border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}
