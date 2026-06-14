import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { propertiesApi } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import Pagination from '../components/Pagination';

const PROPERTY_TYPES = ['APARTMENT', 'VILLA', 'HOUSE', 'CABIN', 'RESORT', 'COTTAGE', 'STUDIO'];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Derive initial filter state from URL
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    propertyType: searchParams.get('propertyType') || '',
  });

  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    propertiesApi.getAmenities().then(setAmenities).catch(() => {});
  }, []);

  const fetchProperties = useCallback(
    async (page = 0) => {
      setLoading(true);
      setError('');
      try {
        const params = {
          ...filters,
          page,
          size: 12,
          ...(selectedAmenities.length > 0 ? { amenityIds: selectedAmenities.join(',') } : {}),
        };
        const data = await propertiesApi.search(params);
        setProperties(data?.content || []);
        setPagination({
          page: data?.page ?? 0,
          totalPages: data?.totalPages ?? 0,
          totalElements: data?.totalElements ?? 0,
        });
      } catch (err) {
        setError(err.message || 'Failed to load properties.');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, selectedAmenities],
  );

  useEffect(() => {
    fetchProperties(0);
  }, [fetchProperties]);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  }

  function handleApplyFilters(e) {
    e.preventDefault();
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== ''),
    );
    setSearchParams(params);
  }

  function toggleAmenity(id) {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  function clearFilters() {
    setFilters({ city: '', checkIn: '', checkOut: '', guests: '', minPrice: '', maxPrice: '', propertyType: '' });
    setSelectedAmenities([]);
    setSearchParams({});
  }

  const today = new Date().toISOString().split('T')[0];

  const Sidebar = (
    <aside className="w-full">
      <form onSubmit={handleApplyFilters} className="space-y-6">
        {/* Dates */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Dates</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Check-in</label>
              <input
                type="date"
                name="checkIn"
                value={filters.checkIn}
                min={today}
                onChange={handleFilterChange}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Check-out</label>
              <input
                type="date"
                name="checkOut"
                value={filters.checkOut}
                min={filters.checkIn || today}
                onChange={handleFilterChange}
                className="input-field text-xs"
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Guests</h3>
          <input
            type="number"
            name="guests"
            value={filters.guests}
            min={1}
            max={20}
            onChange={handleFilterChange}
            placeholder="Number of guests"
            className="input-field text-xs"
          />
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Price per night</h3>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min ₹"
              className="input-field text-xs"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max ₹"
              className="input-field text-xs"
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Property type</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value=""
                checked={filters.propertyType === ''}
                onChange={handleFilterChange}
                className="text-rose-500"
              />
              <span className="text-sm text-gray-700">Any</span>
            </label>
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="propertyType"
                  value={type}
                  checked={filters.propertyType === type}
                  onChange={handleFilterChange}
                  className="text-rose-500"
                />
                <span className="text-sm text-gray-700 capitalize">{type.toLowerCase()}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {amenities.map((a) => (
                <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(a.id)}
                    onChange={() => toggleAmenity(a.id)}
                    className="text-rose-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{a.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1 py-2 text-sm">
            Apply filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="btn-secondary py-2 px-3 text-sm"
          >
            Clear
          </button>
        </div>
      </form>
    </aside>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {filters.city ? `Stays in ${filters.city}` : 'All stays'}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination.totalElements} {pagination.totalElements === 1 ? 'property' : 'properties'} found
            </p>
          )}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="lg:hidden btn-secondary py-2 px-4 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2M15 16h-2" />
          </svg>
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">{Sidebar}</div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {Sidebar}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                  <div className="bg-gray-200 aspect-[4/3]" />
                  <div className="p-4 space-y-2">
                    <div className="bg-gray-200 h-4 rounded w-3/4" />
                    <div className="bg-gray-200 h-3 rounded w-1/2" />
                    <div className="bg-gray-200 h-4 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 text-sm">{error}</p>
              <button onClick={() => fetchProperties(0)} className="mt-4 btn-primary py-2 px-6 text-sm">
                Retry
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your search filters.</p>
              <button onClick={clearFilters} className="btn-primary py-2 px-6 text-sm">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => fetchProperties(p)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
