import type { AmenityResponse, PropertyType, SearchParams } from '@/types';

const PROPERTY_TYPES: { value: PropertyType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'COTTAGE', label: 'Cottage' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'LOFT', label: 'Loft' },
  { value: 'CABIN', label: 'Cabin' },
];

interface FilterPanelProps {
  filters: SearchParams;
  amenities: AmenityResponse[];
  onChange: (updated: SearchParams) => void;
  onReset: () => void;
}

export default function FilterPanel({ filters, amenities, onChange, onReset }: FilterPanelProps) {
  const activeCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.propertyType,
    ...(filters.amenityIds ?? []),
  ].filter(Boolean).length;

  return (
    <aside className="bg-white rounded-2xl border border-gray-200 p-5 space-y-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="bg-brand-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
          <button
            onClick={onReset}
            className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Price range (per night)</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Min</label>
            <input
              type="number"
              min={0}
              placeholder="₹0"
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <span className="text-gray-400 mt-5">–</span>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Max</label>
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Property type */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Property type</h4>
        <div className="space-y-2">
          {PROPERTY_TYPES.map((pt) => (
            <label key={pt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="propertyType"
                value={pt.value}
                checked={(filters.propertyType ?? '') === pt.value}
                onChange={() =>
                  onChange({ ...filters, propertyType: pt.value || undefined })
                }
                className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                {pt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Amenities</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {amenities.map((amenity) => {
              const checked = (filters.amenityIds ?? []).includes(amenity.id);
              return (
                <label key={amenity.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const current = filters.amenityIds ?? [];
                      const updated = checked
                        ? current.filter((id) => id !== amenity.id)
                        : [...current, amenity.id];
                      onChange({ ...filters, amenityIds: updated.length ? updated : undefined });
                    }}
                    className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {amenity.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
