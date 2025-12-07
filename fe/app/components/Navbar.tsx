"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function active(route: string) {
    return path === route ? "text-red-500" : "text-gray-300";
  }

  // Check login state on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    setIsLoggedIn(!!token);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "User");
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
  }, []);

  // Optional: keep in sync if token changes in another tab
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "token") {
        setIsLoggedIn(!!e.newValue);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setIsLoggedIn(false);
    setDropdownOpen(false);
    router.push("/"); // redirect to home after logout
  }

  return (
    <nav className="w-full bg-[#0d0d0d]/80 backdrop-blur-md border-b border-[#222] px-6 py-4 flex items-center justify-between fixed top-0 left-0 z-50">
      {/* Logo */}
      <Link href="/" className="text-3xl font-bold tracking-wide">
        <span className="text-red-500">CINE</span>MAX
      </Link>

      {/* Menu */}
      <div className="flex items-center gap-8 text-lg">
        <Link href="/tickets" className={active("/tickets")}>
          My Tickets
        </Link>
        {/*
        <Link href="/staff/dashboard" className={active("/staff/dashboard")}>
          Staff
        </Link> */}
      </div>

      {/* Actions: search + auth */}
      <div className="flex items-center gap-4">
        <button className="text-gray-300 hover:text-red-500 transition">
          <i className="fas fa-search"></i>
        </button>

        {!isLoggedIn ? (
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition"
          >
            Sign In
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition"
            >
              <span>{userName}</span>
              <svg
                className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-white hover:bg-red-600 transition"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
