import { Link } from "@tanstack/react-router";
import type { PropertySummaryResponse } from "@/types";
import { formatCurrency, propertyTypeLabel } from "@/utils/format";

interface PropertyCardProps {
  property: PropertySummaryResponse;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const placeholder = `https://images.unsplash.com/photo-${
    [
      "1564013799919-ab600027ffc6",
      "1502672260266-1c1ef2d93688",
      "1571003123894-1f0594d2b5d9",
      "1520250497591-112f2f40a3f4",
      "1600596542815-ffad4c1539a9",
    ][property.id % 5]
  }?w=600&q=80`;

  return (
    <Link
      to="/properties/$id"
      params={{ id: String(property.id) }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100 mb-3">
        <img
          src={property.firstPhotoUrl ?? placeholder}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/60 transition-colors"
          aria-label="Save to wishlist"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {propertyTypeLabel(property.propertyType)}
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-gray-500 truncate">
              {property.city}, {property.country}
            </p>
            <p className="font-medium text-gray-900 truncate">
              {property.title}
            </p>
          </div>
          {property.averageRating != null && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <svg
                className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                {property.averageRating.toFixed(1)}
              </span>
              {property.reviewCount != null && (
                <span className="text-xs text-gray-500">
                  ({property.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-gray-700">
          <span className="font-semibold">
            {formatCurrency(property.basePrice)}
          </span>
          <span className="text-gray-500 text-sm"> / night</span>
        </p>
      </div>
    </Link>
  );
}
