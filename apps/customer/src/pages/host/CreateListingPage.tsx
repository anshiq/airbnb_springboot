import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { propertiesApi } from '@/api/properties';
import Spinner from '@/components/common/Spinner';
import type { AmenityResponse } from '@/types';

const STEPS = ['Basic Info', 'Location', 'Amenities', 'Pricing', 'Photos & Submit'];
const PROPERTY_TYPES = ['APARTMENT','HOUSE','VILLA','CONDO','COTTAGE','STUDIO','LOFT','CABIN','OTHER'];
const BOOKING_TYPES = ['INSTANT', 'REQUEST'];
const CANCELLATION_POLICIES = ['FLEXIBLE', 'MODERATE', 'STRICT'];

interface FormState {
  title: string; description: string; propertyType: string;
  maxGuests: number; bedrooms: number; bathrooms: number; beds: number;
  minNights: number; maxNights: number;
  addressLine1: string; city: string; state: string; country: string; zipCode: string;
  amenityIds: number[];
  basePrice: number; cleaningFee: number; bookingType: string; cancellationPolicy: string;
  photos: { url: string; caption: string; primary: boolean; displayOrder: number }[];
}

const INITIAL: FormState = {
  title: '', description: '', propertyType: 'APARTMENT',
  maxGuests: 2, bedrooms: 1, bathrooms: 1, beds: 1,
  minNights: 1, maxNights: 30,
  addressLine1: '', city: '', state: '', country: 'India', zipCode: '',
  amenityIds: [],
  basePrice: 0, cleaningFee: 0, bookingType: 'INSTANT', cancellationPolicy: 'FLEXIBLE',
  photos: [{ url: '', caption: '', primary: true, displayOrder: 0 }],
};

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState('');

  const { data: amenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: propertiesApi.getAmenities,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => propertiesApi.create({
      ...data,
      location: { addressLine1: data.addressLine1, city: data.city, state: data.state, country: data.country, zipCode: data.zipCode },
      photos: data.photos.filter(p => p.url.trim()),
    }),
    onSuccess: async (property) => {
      await propertiesApi.submitForReview(property.id);
      navigate({ to: '/host' });
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Creation failed'),
  });

  const saveDraftMutation = useMutation({
    mutationFn: (data: typeof form) => propertiesApi.create({
      ...data,
      location: { addressLine1: data.addressLine1, city: data.city, state: data.state, country: data.country, zipCode: data.zipCode },
      photos: data.photos.filter(p => p.url.trim()),
    }),
    onSuccess: () => navigate({ to: '/host' }),
    onError: (e) => setError(e instanceof Error ? e.message : 'Save failed'),
  });

  const set = (key: keyof FormState, val: FormState[keyof FormState]) =>
    setForm(f => ({ ...f, [key]: val }));

  const toggleAmenity = (id: number) =>
    set('amenityIds', form.amenityIds.includes(id)
      ? form.amenityIds.filter(a => a !== id)
      : [...form.amenityIds, id]);

  const numericField = (label: string, key: keyof FormState, min = 1, max = 100) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => set(key, Math.max(min, (form[key] as number) - 1))}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 text-gray-700">−</button>
        <span className="w-8 text-center font-medium">{form[key] as number}</span>
        <button type="button" onClick={() => set(key, Math.min(max, (form[key] as number) + 1))}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 text-gray-700">+</button>
      </div>
    </div>
  );

  const canAdvance = () => {
    if (step === 0) return form.title.trim().length > 3 && form.description.trim().length > 10;
    if (step === 1) return form.addressLine1.trim() && form.city.trim() && form.country.trim();
    if (step === 3) return form.basePrice > 0;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a new listing</h1>

      {/* Progress */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{i < step ? '✓' : i + 1}</div>
            <p className={`hidden sm:block ml-1.5 text-xs font-medium ${i === step ? 'text-brand-500' : 'text-gray-400'}`}>{s}</p>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                className="input-base" placeholder="e.g. Cozy beachside apartment in Goa" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={4} className="input-base resize-none" placeholder="Describe what makes your place special…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Property type</label>
              <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)}
                className="input-base">
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {numericField('Max guests', 'maxGuests', 1, 50)}
              {numericField('Bedrooms', 'bedrooms', 0, 20)}
              {numericField('Beds', 'beds', 1, 30)}
              {numericField('Bathrooms', 'bathrooms', 1, 20)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {numericField('Min nights', 'minNights', 1, 30)}
              {numericField('Max nights', 'maxNights', 1, 365)}
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            {(['addressLine1','city','state','country','zipCode'] as (keyof FormState)[]).map(key => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">
                  {key === 'addressLine1' ? 'Street address' : key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input value={form[key] as string} onChange={e => set(key, e.target.value)} className="input-base" />
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Amenities */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
            {amenities ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((a: AmenityResponse) => (
                  <label key={a.id}
                    className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${
                      form.amenityIds.includes(a.id) ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input type="checkbox" checked={form.amenityIds.includes(a.id)} onChange={() => toggleAmenity(a.id)} className="sr-only" />
                    <span className="text-lg">✓</span>
                    <span className="text-sm font-medium text-gray-700">{a.name}</span>
                  </label>
                ))}
              </div>
            ) : <Spinner size="md" className="text-brand-500" />}
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & policies</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Base price / night (₹)</label>
                <input type="number" value={form.basePrice} onChange={e => set('basePrice', Number(e.target.value))}
                  min={0} className="input-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cleaning fee (₹)</label>
                <input type="number" value={form.cleaningFee} onChange={e => set('cleaningFee', Number(e.target.value))}
                  min={0} className="input-base" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Booking type</label>
              <div className="flex gap-3">
                {BOOKING_TYPES.map(t => (
                  <label key={t} className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer ${form.bookingType === t ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                    <input type="radio" name="bookingType" value={t} checked={form.bookingType === t} onChange={e => set('bookingType', e.target.value)} className="sr-only" />
                    <span className="text-sm font-medium">{t === 'INSTANT' ? '⚡ Instant Book' : '📋 Request'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cancellation policy</label>
              <div className="flex gap-3 flex-wrap">
                {CANCELLATION_POLICIES.map(p => (
                  <label key={p} className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer ${form.cancellationPolicy === p ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                    <input type="radio" name="cancellationPolicy" value={p} checked={form.cancellationPolicy === p} onChange={e => set('cancellationPolicy', e.target.value)} className="sr-only" />
                    <span className="text-sm font-medium">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
            <div className="space-y-3">
              {form.photos.map((photo, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl">
                  <div className="flex-1 space-y-2">
                    <input value={photo.url} onChange={e => {
                      const photos = [...form.photos];
                      photos[i] = { ...photos[i], url: e.target.value };
                      set('photos', photos);
                    }} placeholder="Photo URL (https://...)" className="input-base text-xs" />
                    <input value={photo.caption} onChange={e => {
                      const photos = [...form.photos];
                      photos[i] = { ...photos[i], caption: e.target.value };
                      set('photos', photos);
                    }} placeholder="Caption (optional)" className="input-base text-xs" />
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                      <input type="radio" name="primary" checked={photo.primary} onChange={() => {
                        const photos = form.photos.map((p, j) => ({ ...p, primary: j === i }));
                        set('photos', photos);
                      }} />
                      Primary
                    </label>
                    {form.photos.length > 1 && (
                      <button type="button" onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
                        className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    )}
                  </div>
                </div>
              ))}
              {form.photos.length < 10 && (
                <button type="button" onClick={() => set('photos', [...form.photos, { url: '', caption: '', primary: false, displayOrder: form.photos.length }])}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500 transition-colors">
                  + Add another photo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="border border-gray-300 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors">
          ← Back
        </button>
        <div className="flex gap-3">
          {step === STEPS.length - 1 ? (
            <>
              <button onClick={() => { setError(''); saveDraftMutation.mutate(form); }}
                disabled={saveDraftMutation.isPending}
                className="border border-gray-300 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
                {saveDraftMutation.isPending ? 'Saving…' : 'Save as Draft'}
              </button>
              <button onClick={() => { setError(''); createMutation.mutate(form); }}
                disabled={createMutation.isPending}
                className="bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors flex items-center gap-2">
                {createMutation.isPending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Submit for Review
              </button>
            </>
          ) : (
            <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
              className="bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors">
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
