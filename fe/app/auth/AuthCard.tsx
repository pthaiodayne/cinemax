"use client";

import React from "react";

export default function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-[20px]">
      <div className="w-full max-w-md bg-[#111] rounded-2xl p-8 shadow-xl border border-[#222]">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-wide">
            <span className="text-red-500">CINE</span>MAX
          </h1>
          <p className="text-gray-400 mt-2">{title}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
