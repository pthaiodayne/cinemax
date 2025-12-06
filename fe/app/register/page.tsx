"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "../auth/AuthCard";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const router = useRouter();

  async function handleRegister(e: any) {
    e.preventDefault();

    const payload = { name, email, password, phone, dob, gender };
    console.log("Sending registration data:", payload);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("Register response:", data);

    if (data.user) {
      alert("Account created! Please login.");
      router.push("/login");
    } else {
      const errorMsg = data.error || data.message;
      const details = data.details ? '\n' + data.details.map((d: any) => `${d.field}: ${d.message}`).join('\n') : '';
      alert("Register failed: " + errorMsg + details);
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
          required
        />

        <input
          type="email"
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <input
          type="tel"
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          pattern="[0-9]{10}"
          title="Please enter 10 digits"
          required
        />

        <input
          type="date"
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          placeholder="Date of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          max="2010-12-31"
          required
        />

        <select
          className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] focus:border-red-500 outline-none"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

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
