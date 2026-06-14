import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertiesApi } from '../api/properties.js';

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'STUDIO', 'CABIN', 'COTTAGE', 'LOFT', 'OTHER'];
const BOOKING_TYPES = ['INSTANT_BOOK', 'REQUEST_TO_BOOK'];
const CANCELLATION_POLICIES = ['FLEXIBLE', 'MODERATE', 'STRICT'];
const STEPS = ['Basic Info', 'Location', 'Amenities', 'Photos', 'Pricing', 'Review'];

function StepIndicator({ current, total, labels }) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-1 flex-shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              i === current
                ? 'bg-indigo-600 text-white'
                : i < current
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${
              i < current ? 'bg-indigo-500 text-white' : i === current ? 'bg-white text-indigo-600' : 'bg-gray-300 text-gray-600'
            }`}>
              {i < current ? '✓' : i + 1}
            </span>
            {label}
          </div>
          {i < total - 1 && <div className="w-4 h-0.5 bg-gray-200 flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

function FormField({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [amenities, setAmenities] = useState([]);

  // Form state
  const [form, setForm] = useState({
    // Step 1 - Basic
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    // Step 2 - Location
    location: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: '',
      longitude: '',
    },
    // Step 3 - Amenities
    amenityIds: [],
    // Step 4 - Photos
    photos: [],
    // Step 5 - Pricing
    basePrice: '',
    cleaningFee: '',
    minNights: 1,
    maxNights: 30,
    bookingType: 'INSTANT_BOOK',
    cancellationPolicy: 'FLEXIBLE',
  });

  useEffect(() => {
    propertiesApi.getAmenities().then(setAmenities).catch(() => {});
    if (isEdit) {
      propertiesApi.getProperty(id)
        .then((data) => {
          setForm((f) => ({
            ...f,
            title: data.title ?? '',
            description: data.description ?? '',
            propertyType: data.propertyType ?? 'APARTMENT',
            maxGuests: data.maxGuests ?? 2,
            bedrooms: data.bedrooms ?? 1,
            bathrooms: data.bathrooms ?? 1,
            beds: data.beds ?? 1,
            location: {
              addressLine1: data.location?.addressLine1 ?? '',
              addressLine2: data.location?.addressLine2 ?? '',
              city: data.location?.city ?? '',
              state: data.location?.state ?? '',
              country: data.location?.country ?? '',
              zipCode: data.location?.zipCode ?? '',
              latitude: data.location?.latitude ?? '',
              longitude: data.location?.longitude ?? '',
            },
            amenityIds: (data.amenities ?? []).map((a) => a.id ?? a),
            photos: data.photos ?? [],
            basePrice: data.basePrice ?? '',
            cleaningFee: data.cleaningFee ?? '',
            minNights: data.minNights ?? 1,
            maxNights: data.maxNights ?? 30,
            bookingType: data.bookingType ?? 'INSTANT_BOOK',
            cancellationPolicy: data.cancellationPolicy ?? 'FLEXIBLE',
          }));
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setLocation(key, value) {
    setForm((f) => ({ ...f, location: { ...f.location, [key]: value } }));
  }

  function toggleAmenity(amenityId) {
    setForm((f) => ({
      ...f,
      amenityIds: f.amenityIds.includes(amenityId)
        ? f.amenityIds.filter((id) => id !== amenityId)
        : [...f.amenityIds, amenityId],
    }));
  }

  function addPhoto() {
    setForm((f) => ({
      ...f,
      photos: [...f.photos, { url: '', caption: '', primary: f.photos.length === 0, displayOrder: f.photos.length }],
    }));
  }

  function removePhoto(idx) {
    setForm((f) => {
      const photos = f.photos.filter((_, i) => i !== idx).map((p, i) => ({ ...p, displayOrder: i }));
      if (photos.length > 0 && !photos.some((p) => p.primary)) photos[0].primary = true;
      return { ...f, photos };
    });
  }

  function setPhotoField(idx, key, value) {
    setForm((f) => {
      const photos = [...f.photos];
      if (key === 'primary' && value) {
        photos.forEach((p, i) => { photos[i] = { ...p, primary: i === idx }; });
      } else {
        photos[idx] = { ...photos[idx], [key]: value };
      }
      return { ...f, photos };
    });
  }

  function validateStep() {
    if (step === 0) {
      if (!form.title.trim() || !form.description.trim()) {
        setError('Title and description are required');
        return false;
      }
    }
    if (step === 1) {
      const { addressLine1, city, country } = form.location;
      if (!addressLine1.trim() || !city.trim() || !country.trim()) {
        setError('Address line 1, city, and country are required');
        return false;
      }
    }
    if (step === 4) {
      if (!form.basePrice || Number(form.basePrice) <= 0) {
        setError('Base price must be greater than 0');
        return false;
      }
    }
    setError('');
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        propertyType: form.propertyType,
        maxGuests: Number(form.maxGuests),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        beds: Number(form.beds),
        basePrice: Number(form.basePrice),
        cleaningFee: form.cleaningFee ? Number(form.cleaningFee) : 0,
        bookingType: form.bookingType,
        cancellationPolicy: form.cancellationPolicy,
        minNights: Number(form.minNights),
        maxNights: Number(form.maxNights),
        location: {
          ...form.location,
          latitude: form.location.latitude ? Number(form.location.latitude) : undefined,
          longitude: form.location.longitude ? Number(form.location.longitude) : undefined,
        },
        amenityIds: form.amenityIds,
        photos: form.photos.filter((p) => p.url.trim()),
      };

      let saved;
      if (isEdit) {
        saved = await propertiesApi.updateProperty(id, payload);
      } else {
        saved = await propertiesApi.createProperty(payload);
      }
      navigate('/my-listings');
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/my-listings')} className="btn-secondary text-xs">
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? 'Edit Property' : 'Create New Property'}
        </h2>
      </div>

      <StepIndicator current={step} total={STEPS.length} labels={STEPS} />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="card p-6">
        {/* Step 1: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Basic Information</h3>
            <FormField label="Property Title" required>
              <input
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className="input"
                placeholder="Cozy beachside apartment"
              />
            </FormField>
            <FormField label="Description" required>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Describe your property in detail…"
              />
            </FormField>
            <FormField label="Property Type" required>
              <select
                value={form.propertyType}
                onChange={(e) => setField('propertyType', e.target.value)}
                className="input"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FormField>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: 'maxGuests', label: 'Max Guests', min: 1 },
                { key: 'bedrooms', label: 'Bedrooms', min: 0 },
                { key: 'bathrooms', label: 'Bathrooms', min: 0 },
                { key: 'beds', label: 'Beds', min: 1 },
              ].map(({ key, label, min }) => (
                <FormField key={key} label={label} required>
                  <input
                    type="number"
                    min={min}
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    className="input"
                  />
                </FormField>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
            <FormField label="Address Line 1" required>
              <input
                value={form.location.addressLine1}
                onChange={(e) => setLocation('addressLine1', e.target.value)}
                className="input"
                placeholder="123 Main St"
              />
            </FormField>
            <FormField label="Address Line 2">
              <input
                value={form.location.addressLine2}
                onChange={(e) => setLocation('addressLine2', e.target.value)}
                className="input"
                placeholder="Apt 4B (optional)"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="City" required>
                <input
                  value={form.location.city}
                  onChange={(e) => setLocation('city', e.target.value)}
                  className="input"
                  placeholder="New York"
                />
              </FormField>
              <FormField label="State / Province">
                <input
                  value={form.location.state}
                  onChange={(e) => setLocation('state', e.target.value)}
                  className="input"
                  placeholder="NY"
                />
              </FormField>
              <FormField label="Country" required>
                <input
                  value={form.location.country}
                  onChange={(e) => setLocation('country', e.target.value)}
                  className="input"
                  placeholder="United States"
                />
              </FormField>
              <FormField label="ZIP / Postal Code">
                <input
                  value={form.location.zipCode}
                  onChange={(e) => setLocation('zipCode', e.target.value)}
                  className="input"
                  placeholder="10001"
                />
              </FormField>
              <FormField label="Latitude" hint="Optional — improves map accuracy">
                <input
                  type="number"
                  step="any"
                  value={form.location.latitude}
                  onChange={(e) => setLocation('latitude', e.target.value)}
                  className="input"
                  placeholder="40.7128"
                />
              </FormField>
              <FormField label="Longitude" hint="Optional">
                <input
                  type="number"
                  step="any"
                  value={form.location.longitude}
                  onChange={(e) => setLocation('longitude', e.target.value)}
                  className="input"
                  placeholder="-74.0060"
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 3: Amenities */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-1">Amenities</h3>
            <p className="text-sm text-gray-500 mb-4">Select all amenities your property offers</p>
            {amenities.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">Loading amenities…</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenities.map((a) => {
                  const checked = form.amenityIds.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAmenity(a.id)}
                        className="accent-indigo-600"
                      />
                      <span className="text-sm">{a.name ?? a.label ?? a}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Photos</h3>
                <p className="text-sm text-gray-500 mt-0.5">Add photo URLs for your listing</p>
              </div>
              <button onClick={addPhoto} className="btn-primary text-xs">+ Add Photo</button>
            </div>

            {form.photos.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 text-sm">No photos added yet</p>
                <button onClick={addPhoto} className="mt-2 text-indigo-600 text-sm hover:underline">
                  Add your first photo
                </button>
              </div>
            )}

            <div className="space-y-3">
              {form.photos.map((photo, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {photo.url && (
                    <img
                      src={photo.url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 space-y-2 min-w-0">
                    <input
                      value={photo.url}
                      onChange={(e) => setPhotoField(idx, 'url', e.target.value)}
                      className="input text-sm"
                      placeholder="https://example.com/photo.jpg"
                    />
                    <input
                      value={photo.caption}
                      onChange={(e) => setPhotoField(idx, 'caption', e.target.value)}
                      className="input text-sm"
                      placeholder="Caption (optional)"
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                        <input
                          type="radio"
                          name="primaryPhoto"
                          checked={photo.primary}
                          onChange={() => setPhotoField(idx, 'primary', true)}
                          className="accent-indigo-600"
                        />
                        Primary photo
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => removePhoto(idx)}
                    className="text-red-400 hover:text-red-600 transition-colors text-sm p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Pricing */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Pricing & Policies</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Base Price (per night)" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.basePrice}
                    onChange={(e) => setField('basePrice', e.target.value)}
                    className="input pl-7"
                    placeholder="99.00"
                  />
                </div>
              </FormField>
              <FormField label="Cleaning Fee">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cleaningFee}
                    onChange={(e) => setField('cleaningFee', e.target.value)}
                    className="input pl-7"
                    placeholder="25.00"
                  />
                </div>
              </FormField>
              <FormField label="Min Nights" required>
                <input
                  type="number"
                  min="1"
                  value={form.minNights}
                  onChange={(e) => setField('minNights', e.target.value)}
                  className="input"
                />
              </FormField>
              <FormField label="Max Nights" required>
                <input
                  type="number"
                  min="1"
                  value={form.maxNights}
                  onChange={(e) => setField('maxNights', e.target.value)}
                  className="input"
                />
              </FormField>
            </div>
            <FormField label="Booking Type" required>
              <div className="grid grid-cols-2 gap-3">
                {BOOKING_TYPES.map((bt) => (
                  <label
                    key={bt}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.bookingType === bt
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="bookingType"
                      value={bt}
                      checked={form.bookingType === bt}
                      onChange={() => setField('bookingType', bt)}
                      className="accent-indigo-600"
                    />
                    <div>
                      <p className="text-sm font-medium">{bt.replace('_', ' ')}</p>
                    </div>
                  </label>
                ))}
              </div>
            </FormField>
            <FormField label="Cancellation Policy" required>
              <div className="grid grid-cols-3 gap-3">
                {CANCELLATION_POLICIES.map((cp) => (
                  <label
                    key={cp}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.cancellationPolicy === cp
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancellationPolicy"
                      value={cp}
                      checked={form.cancellationPolicy === cp}
                      onChange={() => setField('cancellationPolicy', cp)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm font-medium">{cp}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Review & Submit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Basic Info</h4>
                <p><span className="text-gray-500">Title:</span> {form.title}</p>
                <p><span className="text-gray-500">Type:</span> {form.propertyType}</p>
                <p><span className="text-gray-500">Guests:</span> {form.maxGuests} max</p>
                <p><span className="text-gray-500">Rooms:</span> {form.bedrooms} bed · {form.bathrooms} bath · {form.beds} beds</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Location</h4>
                <p>{form.location.addressLine1}</p>
                {form.location.addressLine2 && <p>{form.location.addressLine2}</p>}
                <p>{form.location.city}, {form.location.state} {form.location.zipCode}</p>
                <p>{form.location.country}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Pricing</h4>
                <p><span className="text-gray-500">Base:</span> ${form.basePrice}/night</p>
                <p><span className="text-gray-500">Cleaning:</span> ${form.cleaningFee || 0}</p>
                <p><span className="text-gray-500">Nights:</span> {form.minNights}–{form.maxNights}</p>
                <p><span className="text-gray-500">Booking:</span> {form.bookingType.replace('_', ' ')}</p>
                <p><span className="text-gray-500">Cancellation:</span> {form.cancellationPolicy}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Extras</h4>
                <p><span className="text-gray-500">Amenities:</span> {form.amenityIds.length} selected</p>
                <p><span className="text-gray-500">Photos:</span> {form.photos.filter(p => p.url).length} added</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-40"
        >
          ← Previous
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={nextStep} className="btn-primary">
            Next: {STEPS[step + 1]} →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Property'}
          </button>
        )}
      </div>
    </div>
  );
}
