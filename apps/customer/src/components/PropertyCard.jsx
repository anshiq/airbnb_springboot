import { Link } from "react-router-dom";
import StarRating from "./StarRating";

export default function PropertyCard({ property }) {
  console.log(property);
  const {
    id,
    title,
    city,
    country,
    basePrice,
    averageRating,
    reviewCount,
    images,
    propertyType,
    maxGuests,
  } = property;

  const imageUrl =
    images && images.length > 0
      ? images[0]
      : `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop`;

  return (
    <Link to={`/properties/${id}`} className="block group">
      <div className="card overflow-hidden">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop";
            }}
          />
          {propertyType && (
            <span className="absolute top-3 left-3 bg-white bg-opacity-90 text-xs font-medium text-gray-700 px-2 py-1 rounded-full">
              {propertyType}
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
              {title}
            </h3>
            {averageRating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <StarRating rating={averageRating} size="sm" />
                <span className="text-xs text-gray-600">
                  {Number(averageRating).toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {city}
            {country ? `, ${country}` : ""}
          </p>
          {maxGuests && (
            <p className="text-xs text-gray-400 mt-0.5">
              Up to {maxGuests} guests
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900">
                ₹{Number(basePrice).toLocaleString("en-IN")}
              </span>
              <span className="text-gray-500 text-sm"> / night</span>
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-400">
                {reviewCount} reviews
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
