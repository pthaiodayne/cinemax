"use client";

import { useState } from "react";
import AuthCard from "../auth/AuthCard";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: any) {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    console.log("Register:", data);

    if (data.user_id) {
      alert("Account created! Please login.");
      window.location.href = "/login";
    } else {
      alert("Register failed: " + data.message);
    }
  }

  return (
    <AuthCard title="Create a new account">
      <form className="flex flex-col space-y-4" onSubmit={handleRegister}>
        
        <input
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="mt-4 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-semibold text-white hover:opacity-90 transition"
        >
          Create Account
        </button>
      </form>

      <p className="text-center text-gray-400 mt-6">
        Already have an account?
        <a className="text-red-500 hover:underline ml-1" href="/login">
          Login
        </a>
      </p>
    </AuthCard>
  );
}
