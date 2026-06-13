import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { SearchParams } from "@/types";

interface SearchBarProps {
  initialValues?: Partial<SearchParams>;
  compact?: boolean;
}

export default function SearchBar({
  initialValues = {},
  compact = false,
}: SearchBarProps) {
  const navigate = useNavigate();
  const [city, setCity] = useState(initialValues.city ?? "");
  const [checkIn, setCheckIn] = useState(initialValues.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initialValues.checkOut ?? "");
  const [guests, setGuests] = useState(initialValues.guests ?? 1);

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (city.trim()) params.city = city.trim();
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    if (guests > 1) params.guests = String(guests);
    navigate({ to: "/search", search: params });
  };

  const today = new Date().toISOString().split("T")[0];

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Where to?"
          className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 min-w-0"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-brand-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-brand-600 transition-colors flex-shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-full shadow-xl border border-gray-200 flex items-center divide-x divide-gray-200 overflow-hidden">
      {/* Location */}
      <div className="flex-1 px-6 py-4">
        <label className="block text-xs font-bold text-gray-800 mb-0.5">
          Where
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search destinations"
          className="w-full text-sm text-gray-600 bg-transparent outline-none placeholder-gray-400"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      {/* Check-in */}
      <div className="px-6 py-4">
        <label className="block text-xs font-bold text-gray-800 mb-0.5">
          Check in
        </label>
        <input
          type="date"
          value={checkIn}
          min={today}
          onChange={(e) => {
            setCheckIn(e.target.value);
            if (checkOut && e.target.value >= checkOut) setCheckOut("");
          }}
          className="text-sm text-gray-600 bg-transparent outline-none cursor-pointer"
        />
      </div>
      {/* Check-out */}
      <div className="px-6 py-4">
        <label className="block text-xs font-bold text-gray-800 mb-0.5">
          Check out
        </label>
        <input
          type="date"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
          className="text-sm text-gray-600 bg-transparent outline-none cursor-pointer"
        />
      </div>
      {/* Guests */}
      <div className="px-6 py-4 flex items-center gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-0.5">
            Guests
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-gray-500 text-sm"
            >
              −
            </button>
            <span className="text-sm text-gray-700 w-4 text-center">
              {guests}
            </span>
            <button
              onClick={() => setGuests((g) => Math.min(16, g + 1))}
              className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-gray-500 text-sm"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="bg-brand-500 hover:bg-brand-600 text-white rounded-full px-5 py-3 flex items-center gap-2 font-semibold transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </div>
  );
}
