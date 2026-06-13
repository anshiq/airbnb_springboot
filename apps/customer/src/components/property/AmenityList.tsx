import { useState } from "react";
import type { AmenityResponse } from "@/types";

interface AmenityListProps {
  amenities: AmenityResponse[];
}

function getAmenityEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("wifi") || n.includes("internet")) return "📶";
  if (n.includes("kitchen") || n.includes("cooking")) return "🍳";
  if (n.includes("parking") || n.includes("garage")) return "🚗";
  if (n.includes("air") || n.includes("ac") || n.includes("cooling"))
    return "❄️";
  if (n.includes("heating") || n.includes("heat")) return "🔥";
  if (n.includes("pool") || n.includes("swim")) return "🏊";
  if (n.includes("gym") || n.includes("fitness") || n.includes("exercise"))
    return "🏋️";
  if (n.includes("tv") || n.includes("television") || n.includes("netflix"))
    return "📺";
  if (n.includes("washer") || n.includes("laundry") || n.includes("dryer"))
    return "🧺";
  if (n.includes("pet") || n.includes("dog") || n.includes("cat")) return "🐾";
  if (n.includes("bbq") || n.includes("grill") || n.includes("barbecue"))
    return "🍖";
  if (n.includes("garden") || n.includes("yard") || n.includes("outdoor"))
    return "🌿";
  if (n.includes("balcony") || n.includes("terrace") || n.includes("patio"))
    return "🏡";
  if (n.includes("beach") || n.includes("sea") || n.includes("ocean"))
    return "🏖️";
  if (n.includes("coffee") || n.includes("espresso")) return "☕";
  if (n.includes("smoke") || n.includes("smoking")) return "🚬";
  if (n.includes("elevator") || n.includes("lift")) return "🛗";
  if (n.includes("desk") || n.includes("workspace") || n.includes("office"))
    return "💼";
  if (n.includes("alarm") || n.includes("security") || n.includes("safe"))
    return "🔒";
  if (n.includes("fire") || n.includes("extinguisher")) return "🧯";
  if (n.includes("first aid") || n.includes("medical")) return "🩺";
  return "✓";
}

export default function AmenityList({ amenities }: AmenityListProps) {
  const [showAll, setShowAll] = useState(false);

  if (amenities.length === 0) return null;

  const visible = showAll ? amenities : amenities.slice(0, 10);
  const visibleGrouped = visible.reduce<Record<string, AmenityResponse[]>>(
    (acc, amenity) => {
      const cat = amenity.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(amenity);
      return acc;
    },
    {},
  );

  return (
    <div>
      <div className="space-y-6">
        {Object.entries(visibleGrouped).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              {category}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((amenity) => (
                <div key={amenity.id} className="flex items-center gap-2.5">
                  <span
                    className="text-lg"
                    role="img"
                    aria-label={amenity.name}
                  >
                    {amenity.icon ?? getAmenityEmoji(amenity.name)}
                  </span>
                  <span className="text-sm text-gray-700">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {amenities.length > 10 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 text-sm font-semibold text-gray-900 underline hover:no-underline transition-all"
        >
          {showAll
            ? "Show fewer amenities"
            : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </div>
  );
}
