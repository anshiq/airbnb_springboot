import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { propertiesApi } from "@/api/properties";
import SearchBar from "@/components/search/SearchBar";
import PropertyCard from "@/components/property/PropertyCard";
import Spinner from "@/components/common/Spinner";

const PROPERTY_TYPES = [
  { type: "APARTMENT", label: "Apartments", emoji: "🏢" },
  { type: "HOUSE", label: "Houses", emoji: "🏠" },
  { type: "VILLA", label: "Villas", emoji: "🏖️" },
  { type: "CABIN", label: "Cabins", emoji: "🌲" },
  { type: "STUDIO", label: "Studios", emoji: "🎨" },
  { type: "LOFT", label: "Lofts", emoji: "🏙️" },
];

const DESTINATIONS = [
  {
    city: "Mumbai",
    img: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80",
  },
  {
    city: "Goa",
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80",
  },
  {
    city: "Bangalore",
    img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80",
  },
  {
    city: "Jaipur",
    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80",
  },
];

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: () =>
      propertiesApi.search({
        page: 0,
        size: 8,
        sortBy: "averageRating",
        sortDir: "desc",
      }),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Find your perfect
            <br />
            stay
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Discover unique homes, apartments, and villas across India and
            beyond.
          </p>
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Property type filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {PROPERTY_TYPES.map(({ type, label, emoji }) => (
            <Link
              key={type}
              to="/search"
              search={{ propertyType: type } as Record<string, string>}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:border-brand-500 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium text-gray-700 group-hover:text-brand-500 whitespace-nowrap">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured stays</h2>
          <Link
            to="/search"
            className="text-brand-500 text-sm font-medium hover:text-brand-600"
          >
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-brand-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.content.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* Popular destinations */}
      <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Explore popular destinations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {DESTINATIONS.map(({ city, img }) => (
              <Link
                key={city}
                to="/search"
                search={{ city } as Record<string, string>}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200"
              >
                <img
                  src={img}
                  alt={city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-3 left-3 text-white font-semibold text-lg">
                  {city}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for hosting */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Become a host</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Turn your spare room or property into income. Join thousands of
            hosts on StayEase.
          </p>
          <Link
            to="/auth/register"
            className="inline-block bg-white text-brand-500 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-md"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
