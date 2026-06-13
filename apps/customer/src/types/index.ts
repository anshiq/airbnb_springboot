// ─── Generic API wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole =
  | 'GUEST'
  | 'HOST'
  | 'PROPERTY_MANAGER'
  | 'SUPPORT_AGENT'
  | 'SUPER_ADMIN';

export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profilePhotoUrl?: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

// ─── User ────────────────────────────────────────────────────────────────────
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  profilePhotoUrl?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
}

// ─── Property ────────────────────────────────────────────────────────────────
export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'ARCHIVED';
export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'CONDO'
  | 'COTTAGE'
  | 'STUDIO'
  | 'LOFT'
  | 'CABIN'
  | 'OTHER';
export type BookingType = 'INSTANT' | 'REQUEST';
export type CancellationPolicy = 'FLEXIBLE' | 'MODERATE' | 'STRICT';

export interface LocationResponse {
  id: number;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface PhotoResponse {
  id: number;
  url: string;
  caption?: string;
  primary: boolean;
  displayOrder: number;
}

export interface AmenityResponse {
  id: number;
  name: string;
  category: string;
  icon?: string;
}

export interface HostSummary {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  memberSince: string;
}

export interface PropertySummaryResponse {
  id: number;
  title: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  basePrice: number;
  averageRating?: number;
  reviewCount?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  city: string;
  country: string;
  firstPhotoUrl?: string;
  hostId: number;
  hostName: string;
  createdAt: string;
}

export interface PropertyResponse {
  id: number;
  title: string;
  description: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  basePrice: number;
  cleaningFee?: number;
  serviceFeePercent?: number;
  taxPercent?: number;
  bookingType: BookingType;
  cancellationPolicy: CancellationPolicy;
  minNights: number;
  maxNights: number;
  averageRating?: number;
  reviewCount?: number;
  location: LocationResponse;
  photos: PhotoResponse[];
  amenities: AmenityResponse[];
  host: HostSummary;
  createdAt: string;
}

// ─── Booking ─────────────────────────────────────────────────────────────────
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface BookingRequest {
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  specialRequests?: string;
}

export interface BookingPropertySummary {
  id: number;
  title: string;
  city: string;
  country: string;
  primaryPhotoUrl?: string;
}

export interface BookingGuestSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl?: string;
}

export interface BookingPaymentSummary {
  id: number;
  status: string;
  razorpayOrderId?: string;
  amount: number;
}

export interface BookingResponse {
  id: number;
  status: BookingStatus;
  bookingType: BookingType;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  nights: number;
  basePricePerNight: number;
  subtotal: number;
  cleaningFee?: number;
  serviceFee?: number;
  taxes?: number;
  totalPrice: number;
  specialRequests?: string;
  cancellationReason?: string;
  property: BookingPropertySummary;
  guest: BookingGuestSummary;
  payment?: BookingPaymentSummary;
  createdAt: string;
}

export interface PriceBreakdownResponse {
  nights: number;
  basePricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface ReviewResponse {
  id: number;
  overallRating: number;
  cleanlinessRating: number;
  accuracyRating: number;
  checkInRating: number;
  communicationRating: number;
  locationRating: number;
  valueRating: number;
  comment: string;
  hostResponse?: string;
  isVisible: boolean;
  guestName: string;
  guestPhotoUrl?: string;
  propertyId: number;
  bookingId: number;
  createdAt: string;
}

export interface ReviewRequest {
  bookingId: number;
  overallRating: number;
  cleanlinessRating: number;
  accuracyRating: number;
  checkInRating: number;
  communicationRating: number;
  locationRating: number;
  valueRating: number;
  comment: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export interface PaymentResponse {
  id: number;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  bookingId: number;
}

export interface CreateOrderRequest {
  bookingId: number;
}

export interface PaymentVerifyRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  bookingId: number;
}

// ─── Search params ───────────────────────────────────────────────────────────
export interface SearchParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  amenityIds?: number[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
