"use client";

import { useState } from "react";
import AuthCard from "../auth/AuthCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login success!");
    } else {
      alert("Login failed: " + data.message);
    }
  }

  return (
    <AuthCard title="Sign in to your account">
      <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
        
        <input
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="mt-4 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-semibold text-white hover:opacity-90 transition"
        >
          Sign In
        </button>
      </form>

      <p className="text-center text-gray-400 mt-6">
        Don't have an account?
        <a className="text-red-500 hover:underline ml-1" href="/register">
          Register
        </a>
      </p>
    </AuthCard>
  );
}
