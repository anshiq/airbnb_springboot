import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { propertiesApi } from "@/api/properties";
import SearchBar from "@/components/search/SearchBar";
import PropertyCard from "@/components/property/PropertyCard";
import Pagination from "@/components/common/Pagination";
import Spinner from "@/components/common/Spinner";
import type { PropertyType, SearchParams } from "@/types";

const PROPERTY_TYPES: { value: PropertyType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "VILLA", label: "Villa" },
  { value: "CONDO", label: "Condo" },
  { value: "COTTAGE", label: "Cottage" },
  { value: "STUDIO", label: "Studio" },
  { value: "LOFT", label: "Loft" },
  { value: "CABIN", label: "Cabin" },
];

export default function SearchPage() {
  const rawSearch = useSearch({ strict: false }) as Record<string, string>;
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [minPrice, setMinPrice] = useState(rawSearch.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(rawSearch.maxPrice ?? "");
  const [propType, setPropType] = useState(rawSearch.propertyType ?? "");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const searchParams: SearchParams = {
    city: rawSearch.city,
    checkIn: rawSearch.checkIn,
    checkOut: rawSearch.checkOut,
    guests: rawSearch.guests ? Number(rawSearch.guests) : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    propertyType: (propType as PropertyType) || undefined,
    page,
    size: 20,
    sortBy: "basePrice",
    sortDir,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["search", searchParams],
    queryFn: () => propertiesApi.search(searchParams),
    staleTime: 30_000,
  });

  const applyFilters = () => {
    setPage(0);
    const p: Record<string, string> = { ...rawSearch };
    if (minPrice) p.minPrice = minPrice;
    if (maxPrice) p.maxPrice = maxPrice;
    if (propType) p.propertyType = propType;
    navigate({ to: "/search", search: p });
  };

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setPropType("");
    setPage(0);
    const {
      minPrice: _mp,
      maxPrice: _xp,
      propertyType: _pt,
      ...rest
    } = rawSearch;
    void _mp;
    void _xp;
    void _pt;
    navigate({ to: "/search", search: rest });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top search bar */}
      <div className="mb-6">
        <SearchBar
          initialValues={{
            city: rawSearch.city,
            checkIn: rawSearch.checkIn,
            checkOut: rawSearch.checkOut,
            guests: rawSearch.guests ? Number(rawSearch.guests) : 1,
          }}
          compact
        />
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-20 space-y-6">
            <h3 className="font-semibold text-gray-900">Filters</h3>

            {/* Price range */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Price per night
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Property type */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Property type
              </h4>
              <div className="space-y-2">
                {PROPERTY_TYPES.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value={value}
                      checked={propType === value}
                      onChange={(e) => setPropType(e.target.value)}
                      className="text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Sort by price
              </h4>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-brand-500 text-white text-sm font-medium py-2 rounded-xl hover:bg-brand-600 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {isLoading
                ? "Searching…"
                : data
                  ? `${data.totalElements} stay${data.totalElements !== 1 ? "s" : ""} found${rawSearch.city ? ` in ${rawSearch.city}` : ""}`
                  : ""}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" className="text-brand-500" />
            </div>
          ) : data?.content.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search a different location.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-brand-500 text-sm font-medium hover:text-brand-600"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {data?.content.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              {data && (
                <Pagination
                  currentPage={data.number}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
