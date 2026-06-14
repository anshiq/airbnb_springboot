import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { propertiesApi } from "../api/properties.js";

const PROPERTY_TYPES = [
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "COTTAGE",
  "STUDIO",
  "LOFT",
  "CABIN",
  "TOWNHOUSE",
  "BUNGALOW",
  "PENTHOUSE",
];
const BOOKING_TYPES = ["INSTANT", "REQUEST_TO_BOOK"];
const CANCELLATION_POLICIES = ["FLEXIBLE", "MODERATE", "STRICT"];
const STEPS = [
  "Basic Info",
  "Location",
  "Amenities",
  "Photos",
  "Pricing",
  "Availability",
  "Review",
];

/* ──────────────────────────────────── helpers ── */
function StepIndicator({ current, labels }) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-1 flex-shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              i === current
                ? "bg-indigo-600 text-white"
                : i < current
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${
                i < current
                  ? "bg-indigo-500 text-white"
                  : i === current
                    ? "bg-white text-indigo-600"
                    : "bg-gray-300 text-gray-600"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </span>
            {label}
          </div>
          {i < labels.length - 1 && (
            <div className="w-4 h-0.5 bg-gray-200 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function FormField({ label, required, hint, children }) {
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

/* ──────────────────── Availability Calendar ── */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function AvailabilityStep({ propertyId, onDone, onSkip }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [changes, setChanges] = useState({}); // "YYYY-MM-DD" -> { available, customPrice }
  const [priceInput, setPriceInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  function dateStr(d) {
    return `${year}-${pad(month + 1)}-${pad(d)}`;
  }

  function toggleDate(d) {
    const ds = dateStr(d);
    const isPast =
      new Date(year, month, d) <
      new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isPast) return;
    setChanges((prev) => {
      const cur = prev[ds];
      if (!cur) return { ...prev, [ds]: { available: false } };
      if (!cur.available) return { ...prev, [ds]: { available: true } };
      const next = { ...prev };
      delete next[ds];
      return next;
    });
    setSelected(ds);
  }

  function setCustomPrice(ds, price) {
    setChanges((prev) => ({
      ...prev,
      [ds]: {
        ...(prev[ds] ?? { available: true }),
        customPrice: price ? Number(price) : undefined,
      },
    }));
  }

  async function handleSave() {
    if (Object.keys(changes).length === 0) {
      onDone();
      return;
    }
    setSaving(true);
    setError("");
    try {
      const dates = Object.entries(changes).map(([date, v]) => ({
        date,
        available: v.available,
        customPrice: v.customPrice || undefined,
      }));
      await propertiesApi.updateAvailability(propertyId, dates);
      setSaved(true);
      setTimeout(onDone, 800);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const days = [];
  for (let i = 0; i < firstDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-800">Availability Calendar</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Click dates to mark them unavailable (blocked). By default all dates
          are available.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          ✓ Availability saved!
        </div>
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm"
        >
          ← Prev
        </button>
        <span className="font-semibold text-gray-800">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm"
        >
          Next →
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
          Blocked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300 inline-block" />
          Custom price
        </span>
      </div>

      {/* Calendar grid */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium text-gray-500"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {days.map((d, i) => {
            if (!d)
              return <div key={`e-${i}`} className="h-12 bg-gray-50/50" />;
            const ds = dateStr(d);
            const isPast =
              new Date(year, month, d) <
              new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const ch = changes[ds];
            const isBlocked = ch && !ch.available;
            const hasCustomPrice = ch?.customPrice;
            return (
              <button
                key={ds}
                onClick={() => toggleDate(d)}
                disabled={isPast}
                title={
                  isBlocked
                    ? "Blocked — click to unblock"
                    : "Available — click to block"
                }
                className={`h-12 flex flex-col items-center justify-center text-xs transition-colors relative ${
                  isPast
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : isBlocked
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : hasCustomPrice
                        ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        : "bg-white text-gray-700 hover:bg-green-50"
                }`}
              >
                <span className="font-medium">{d}</span>
                {hasCustomPrice && (
                  <span className="text-[9px] text-indigo-500">
                    ${ch.customPrice}
                  </span>
                )}
                {isBlocked && <span className="text-[9px]">✕</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom price for selected date */}
      {selected &&
        changes[selected] &&
        !changes[selected].available === false && (
          <div className="p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm font-medium text-indigo-800 mb-2">
              Custom price for {selected}
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={changes[selected]?.customPrice ?? ""}
                onChange={(e) => setCustomPrice(selected, e.target.value)}
                className="input flex-1 text-sm"
                placeholder="Custom price (optional)"
              />
            </div>
          </div>
        )}

      {/* Also allow setting custom price for unblocked days */}
      {selected && (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Set custom price for{" "}
            <span className="text-indigo-600">{selected}</span>
          </p>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={changes[selected]?.customPrice ?? ""}
                onChange={(e) => setCustomPrice(selected, e.target.value)}
                className="input pl-7 text-sm"
                placeholder="Leave empty to use base price"
              />
            </div>
            <button
              onClick={() => setSelected(null)}
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        {Object.keys(changes).length} date(s) modified · Click any date in the
        calendar to select it and set a custom price
      </p>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving
            ? "Saving…"
            : saved
              ? "✓ Saved"
              : `Save Availability${Object.keys(changes).length > 0 ? ` (${Object.keys(changes).length} changes)` : ""}`}
        </button>
        <button onClick={onSkip} className="btn-secondary text-sm">
          Skip for now →
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────── Main Component ── */
export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [savedId, setSavedId] = useState(isEdit ? id : null); // ID of saved property

  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "APARTMENT",
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    location: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      latitude: "",
      longitude: "",
    },
    amenityIds: [],
    photos: [],
    basePrice: "",
    cleaningFee: "",
    minNights: 1,
    maxNights: 30,
    bookingType: "INSTANT",
    cancellationPolicy: "FLEXIBLE",
  });

  useEffect(() => {
    propertiesApi
      .getAmenities()
      .then(setAmenities)
      .catch(() => {});
    if (isEdit) {
      propertiesApi
        .getProperty(id)
        .then((data) => {
          setForm((f) => ({
            ...f,
            title: data.title ?? "",
            description: data.description ?? "",
            propertyType: data.propertyType ?? "APARTMENT",
            maxGuests: data.maxGuests ?? 2,
            bedrooms: data.bedrooms ?? 1,
            bathrooms: data.bathrooms ?? 1,
            beds: data.beds ?? 1,
            location: {
              addressLine1: data.location?.addressLine1 ?? "",
              addressLine2: data.location?.addressLine2 ?? "",
              city: data.location?.city ?? "",
              state: data.location?.state ?? "",
              country: data.location?.country ?? "",
              zipCode: data.location?.zipCode ?? "",
              latitude: data.location?.latitude ?? "",
              longitude: data.location?.longitude ?? "",
            },
            amenityIds: (data.amenities ?? []).map((a) =>
              typeof a === "object" ? a.id : a,
            ),
            photos: data.photos ?? [],
            basePrice: data.basePrice ?? "",
            cleaningFee: data.cleaningFee ?? "",
            minNights: data.minNights ?? 1,
            maxNights: data.maxNights ?? 30,
            bookingType: data.bookingType ?? "INSTANT_BOOK",
            cancellationPolicy: data.cancellationPolicy ?? "FLEXIBLE",
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
        ? f.amenityIds.filter((x) => x !== amenityId)
        : [...f.amenityIds, amenityId],
    }));
  }
  function addPhoto() {
    setForm((f) => ({
      ...f,
      photos: [
        ...f.photos,
        {
          url: "",
          caption: "",
          primary: f.photos.length === 0,
          displayOrder: f.photos.length,
        },
      ],
    }));
  }
  function removePhoto(idx) {
    setForm((f) => {
      const photos = f.photos
        .filter((_, i) => i !== idx)
        .map((p, i) => ({ ...p, displayOrder: i }));
      if (photos.length > 0 && !photos.some((p) => p.primary))
        photos[0].primary = true;
      return { ...f, photos };
    });
  }
  function setPhotoField(idx, key, value) {
    setForm((f) => {
      const photos = [...f.photos];
      if (key === "primary" && value) {
        photos.forEach((p, i) => {
          photos[i] = { ...p, primary: i === idx };
        });
      } else {
        photos[idx] = { ...photos[idx], [key]: value };
      }
      return { ...f, photos };
    });
  }

  function validateStep() {
    setError("");
    if (step === 0) {
      if (!form.title.trim() || !form.description.trim()) {
        setError("Title and description are required");
        return false;
      }
    }
    if (step === 1) {
      const { addressLine1, city, country } = form.location;
      if (!addressLine1.trim() || !city.trim() || !country.trim()) {
        setError("Address line 1, city, and country are required");
        return false;
      }
    }
    if (step === 4) {
      if (!form.basePrice || Number(form.basePrice) <= 0) {
        setError("Base price must be greater than 0");
        return false;
      }
    }
    return true;
  }

  function buildPayload() {
    return {
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
        latitude: form.location.latitude
          ? Number(form.location.latitude)
          : undefined,
        longitude: form.location.longitude
          ? Number(form.location.longitude)
          : undefined,
      },
      amenityIds: form.amenityIds,
      photos: form.photos.filter((p) => p.url.trim()),
    };
  }

  // Called when moving from Pricing (step 4) → Availability (step 5)
  async function handleSaveAndContinue() {
    if (!validateStep()) return;
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload();
      let result;
      if (isEdit) {
        result = await propertiesApi.updateProperty(id, payload);
      } else {
        result = await propertiesApi.createProperty(payload);
      }
      setSavedId(result.id);
      setStep(5);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Called when moving from Availability (step 5) → Review (step 6)
  function handleAvailDone() {
    setStep(6);
  }
  function handleAvailSkip() {
    setStep(6);
  }

  // Final submit (from Review step): just submit for moderation
  async function handleFinalSubmit() {
    setSaving(true);
    setError("");
    try {
      if (savedId) {
        await propertiesApi.submitProperty(savedId);
      }
      navigate("/my-listings");
    } catch (e) {
      // submit for review failed — still navigate to listings
      navigate("/my-listings");
    } finally {
      setSaving(false);
    }
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  }
  function prevStep() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
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
        <button
          onClick={() => navigate("/my-listings")}
          className="btn-secondary text-xs"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Edit Property" : "Create New Property"}
        </h2>
      </div>

      <StepIndicator current={step} labels={STEPS} />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="card p-6">
        {/* ── Step 1: Basic Info ── */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Basic Information
            </h3>
            <FormField label="Property Title" required>
              <input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                className="input"
                placeholder="Cozy beachside apartment"
              />
            </FormField>
            <FormField label="Description" required>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Describe your property in detail…"
              />
            </FormField>
            <FormField label="Property Type" required>
              <select
                value={form.propertyType}
                onChange={(e) => setField("propertyType", e.target.value)}
                className="input"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: "maxGuests", label: "Max Guests", min: 1 },
                { key: "bedrooms", label: "Bedrooms", min: 0 },
                { key: "bathrooms", label: "Bathrooms", min: 0 },
                { key: "beds", label: "Beds", min: 1 },
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

        {/* ── Step 2: Location ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
            <FormField label="Address Line 1" required>
              <input
                value={form.location.addressLine1}
                onChange={(e) => setLocation("addressLine1", e.target.value)}
                className="input"
                placeholder="123 Main St"
              />
            </FormField>
            <FormField label="Address Line 2">
              <input
                value={form.location.addressLine2}
                onChange={(e) => setLocation("addressLine2", e.target.value)}
                className="input"
                placeholder="Apt 4B (optional)"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="City" required>
                <input
                  value={form.location.city}
                  onChange={(e) => setLocation("city", e.target.value)}
                  className="input"
                  placeholder="Mumbai"
                />
              </FormField>
              <FormField label="State / Province">
                <input
                  value={form.location.state}
                  onChange={(e) => setLocation("state", e.target.value)}
                  className="input"
                  placeholder="Maharashtra"
                />
              </FormField>
              <FormField label="Country" required>
                <input
                  value={form.location.country}
                  onChange={(e) => setLocation("country", e.target.value)}
                  className="input"
                  placeholder="India"
                />
              </FormField>
              <FormField label="ZIP / Postal Code">
                <input
                  value={form.location.zipCode}
                  onChange={(e) => setLocation("zipCode", e.target.value)}
                  className="input"
                  placeholder="400001"
                />
              </FormField>
              <FormField
                label="Latitude"
                hint="Optional — improves map accuracy"
              >
                <input
                  type="number"
                  step="any"
                  value={form.location.latitude}
                  onChange={(e) => setLocation("latitude", e.target.value)}
                  className="input"
                  placeholder="19.0760"
                />
              </FormField>
              <FormField label="Longitude" hint="Optional">
                <input
                  type="number"
                  step="any"
                  value={form.location.longitude}
                  onChange={(e) => setLocation("longitude", e.target.value)}
                  className="input"
                  placeholder="72.8777"
                />
              </FormField>
            </div>
          </div>
        )}

        {/* ── Step 3: Amenities ── */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-1">Amenities</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select all amenities your property offers
            </p>
            {amenities.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">
                Loading amenities…
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenities.map((a) => {
                  const amenityId = typeof a === "object" ? a.id : a;
                  const label = typeof a === "object" ? (a.name ?? a.label) : a;
                  const checked = form.amenityIds.includes(amenityId);
                  return (
                    <label
                      key={amenityId}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? "bg-indigo-50 border-indigo-400 text-indigo-800"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAmenity(amenityId)}
                        className="accent-indigo-600"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Photos ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Photos</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Add photo URLs for your listing
                </p>
              </div>
              <button onClick={addPhoto} className="btn-primary text-xs">
                + Add Photo
              </button>
            </div>
            {form.photos.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 text-sm">No photos added yet</p>
                <button
                  onClick={addPhoto}
                  className="mt-2 text-indigo-600 text-sm hover:underline"
                >
                  Add your first photo
                </button>
              </div>
            )}
            <div className="space-y-3">
              {form.photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl border border-gray-200"
                >
                  {photo.url && (
                    <img
                      src={photo.url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1 space-y-2 min-w-0">
                    <input
                      value={photo.url}
                      onChange={(e) =>
                        setPhotoField(idx, "url", e.target.value)
                      }
                      className="input text-sm"
                      placeholder="https://example.com/photo.jpg"
                    />
                    <input
                      value={photo.caption}
                      onChange={(e) =>
                        setPhotoField(idx, "caption", e.target.value)
                      }
                      className="input text-sm"
                      placeholder="Caption (optional)"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        name="primaryPhoto"
                        checked={photo.primary}
                        onChange={() => setPhotoField(idx, "primary", true)}
                        className="accent-indigo-600"
                      />
                      Primary photo
                    </label>
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

        {/* ── Step 5: Pricing ── */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Pricing & Policies
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Base Price (per night)" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.basePrice}
                    onChange={(e) => setField("basePrice", e.target.value)}
                    className="input pl-7"
                    placeholder="99.00"
                  />
                </div>
              </FormField>
              <FormField label="Cleaning Fee">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cleaningFee}
                    onChange={(e) => setField("cleaningFee", e.target.value)}
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
                  onChange={(e) => setField("minNights", e.target.value)}
                  className="input"
                />
              </FormField>
              <FormField label="Max Nights" required>
                <input
                  type="number"
                  min="1"
                  value={form.maxNights}
                  onChange={(e) => setField("maxNights", e.target.value)}
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
                        ? "bg-indigo-50 border-indigo-400 text-indigo-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bookingType"
                      value={bt}
                      checked={form.bookingType === bt}
                      onChange={() => setField("bookingType", bt)}
                      className="accent-indigo-600"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {bt.replace("_", " ")}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {bt === "INSTANT_BOOK"
                          ? "Guests can book immediately"
                          : "You approve each booking request"}
                      </p>
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
                        ? "bg-indigo-50 border-indigo-400 text-indigo-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancellationPolicy"
                      value={cp}
                      checked={form.cancellationPolicy === cp}
                      onChange={() => setField("cancellationPolicy", cp)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm font-medium">{cp}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>
        )}

        {/* ── Step 6: Availability ── */}
        {step === 5 &&
          (savedId ? (
            <AvailabilityStep
              propertyId={savedId}
              onDone={handleAvailDone}
              onSkip={handleAvailSkip}
            />
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p>
                Property must be saved first. Click "Save &amp; Set
                Availability" below.
              </p>
            </div>
          ))}

        {/* ── Step 7: Review ── */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Review &amp; Submit
            </h3>
            <p className="text-sm text-gray-500">
              Your property has been saved{savedId ? ` (ID: ${savedId})` : ""}.
              Review the details below and submit for moderation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                  Basic Info
                </h4>
                <p>
                  <span className="text-gray-500">Title:</span> {form.title}
                </p>
                <p>
                  <span className="text-gray-500">Type:</span>{" "}
                  {form.propertyType}
                </p>
                <p>
                  <span className="text-gray-500">Guests:</span>{" "}
                  {form.maxGuests} max
                </p>
                <p>
                  <span className="text-gray-500">Rooms:</span> {form.bedrooms}{" "}
                  bed · {form.bathrooms} bath · {form.beds} beds
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                  Location
                </h4>
                <p>{form.location.addressLine1}</p>
                {form.location.addressLine2 && (
                  <p>{form.location.addressLine2}</p>
                )}
                <p>
                  {form.location.city}
                  {form.location.state ? `, ${form.location.state}` : ""}{" "}
                  {form.location.zipCode}
                </p>
                <p>{form.location.country}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                  Pricing
                </h4>
                <p>
                  <span className="text-gray-500">Base:</span> ${form.basePrice}
                  /night
                </p>
                <p>
                  <span className="text-gray-500">Cleaning:</span> $
                  {form.cleaningFee || 0}
                </p>
                <p>
                  <span className="text-gray-500">Stay:</span> {form.minNights}–
                  {form.maxNights} nights
                </p>
                <p>
                  <span className="text-gray-500">Booking:</span>{" "}
                  {form.bookingType.replace("_", " ")}
                </p>
                <p>
                  <span className="text-gray-500">Cancellation:</span>{" "}
                  {form.cancellationPolicy}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                  Extras
                </h4>
                <p>
                  <span className="text-gray-500">Amenities:</span>{" "}
                  {form.amenityIds.length} selected
                </p>
                <p>
                  <span className="text-gray-500">Photos:</span>{" "}
                  {form.photos.filter((p) => p.url).length} added
                </p>
              </div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <p className="text-sm text-indigo-800">
                <strong>Status flow:</strong> Draft →{" "}
                <strong>Pending Review</strong> → Active (after approval)
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                Clicking "Submit for Review" will send your listing to the
                moderation queue. A property manager will review it shortly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-40"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-3">
          {/* Step 4 (Pricing) → saves property then goes to Availability */}
          {step === 4 && (
            <button
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving…" : "Save & Set Availability →"}
            </button>
          )}

          {/* Step 5 (Availability) nav is handled inside the AvailabilityStep component */}

          {/* Steps 0-3: regular next */}
          {step < 4 && (
            <button onClick={nextStep} className="btn-primary">
              Next: {STEPS[step + 1]} →
            </button>
          )}

          {/* Step 6 (Review): final submit */}
          {step === 6 && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/my-listings")}
                className="btn-secondary"
              >
                Save as Draft
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Submitting…" : "Submit for Review"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
