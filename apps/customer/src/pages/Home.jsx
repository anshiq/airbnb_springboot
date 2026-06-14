import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PROPERTY_TYPES = [
  { label: 'All Stays', icon: '🏠', value: '' },
  { label: 'Apartment', icon: '🏢', value: 'APARTMENT' },
  { label: 'Villa', icon: '🏡', value: 'VILLA' },
  { label: 'House', icon: '🏘️', value: 'HOUSE' },
  { label: 'Cabin', icon: '🌲', value: 'CABIN' },
  { label: 'Resort', icon: '🏖️', value: 'RESORT' },
];

const POPULAR_DESTINATIONS = [
  { city: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop', tagline: 'Sun & beaches' },
  { city: 'Mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop', tagline: 'City that never sleeps' },
  { city: 'Jaipur', image: 'https://images.unsplash.com/photo-1477587458883-47145ed68ece?w=400&h=300&fit=crop', tagline: 'The Pink City' },
  { city: 'Kerala', image: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=400&h=300&fit=crop', tagline: 'God\'s Own Country' },
];

export default function Home() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    city: '',
    checkIn: today,
    checkOut: tomorrow,
    guests: 1,
  });
  const [selectedType, setSelectedType] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === 'checkIn' && value >= f.checkOut ? { checkOut: value } : {}),
    }));
  }

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.city) params.set('city', form.city);
    if (form.checkIn) params.set('checkIn', form.checkIn);
    if (form.checkOut) params.set('checkOut', form.checkOut);
    if (form.guests) params.set('guests', form.guests);
    if (selectedType) params.set('propertyType', selectedType);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-50 via-white to-rose-50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-200 rounded-full opacity-30 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Find your{' '}
            <span className="text-rose-500">perfect</span> stay
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Discover unique homes, villas, and experiences across India and beyond.
          </p>

          {/* Search Card */}
          <form
            onSubmit={handleSearch}
            className="mt-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-0.5">
              {/* City */}
              <div className="sm:col-span-1 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Where
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City or destination"
                  className="w-full text-sm text-gray-900 placeholder-gray-400 bg-transparent border-0 outline-none"
                />
              </div>

              <div className="hidden sm:block w-px bg-gray-200 self-stretch my-2" />

              {/* Check-in */}
              <div className="px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Check-in
                </label>
                <input
                  type="date"
                  name="checkIn"
                  value={form.checkIn}
                  min={today}
                  onChange={handleChange}
                  className="w-full text-sm text-gray-900 bg-transparent border-0 outline-none"
                />
              </div>

              <div className="hidden sm:block w-px bg-gray-200 self-stretch my-2" />

              {/* Check-out */}
              <div className="px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Check-out
                </label>
                <input
                  type="date"
                  name="checkOut"
                  value={form.checkOut}
                  min={form.checkIn || today}
                  onChange={handleChange}
                  className="w-full text-sm text-gray-900 bg-transparent border-0 outline-none"
                />
              </div>

              <div className="hidden sm:block w-px bg-gray-200 self-stretch my-2" />

              {/* Guests + Search */}
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Guests
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={form.guests}
                    min={1}
                    max={20}
                    onChange={handleChange}
                    className="w-full text-sm text-gray-900 bg-transparent border-0 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl p-3 transition-colors shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Property type filters */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setSelectedType(type.value);
                const params = new URLSearchParams();
                if (form.city) params.set('city', form.city);
                if (type.value) params.set('propertyType', type.value);
                navigate(`/search?${params.toString()}`);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === type.value
                  ? 'border-rose-500 bg-rose-50 text-rose-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </section>

      {/* Popular destinations */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular destinations</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.city}
              onClick={() => navigate(`/search?city=${encodeURIComponent(dest.city)}`)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] text-left"
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-white font-bold text-lg leading-tight">{dest.city}</p>
                <p className="text-white/80 text-sm">{dest.tagline}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">How StayFinder works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Search', desc: 'Find the perfect property by location, dates, and guests.' },
              { icon: '📅', title: 'Book', desc: 'Reserve your stay with a secure, hassle-free booking.' },
              { icon: '🏡', title: 'Enjoy', desc: 'Check in and enjoy your perfect home away from home.' },
            ].map((step) => (
              <div key={step.title} className="flex flex-col items-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
