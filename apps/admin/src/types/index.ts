// ─── Generic API wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean; message?: string; data: T; timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number; totalPages: number;
  number: number; size: number;
  first: boolean; last: boolean;
}

// ─── Auth / User ─────────────────────────────────────────────────────────────
export type UserRole = 'GUEST' | 'HOST' | 'PROPERTY_MANAGER' | 'SUPPORT_AGENT' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export interface UserSummary {
  id: number; firstName: string; lastName: string;
  email: string; role: UserRole;
  profilePhotoUrl?: string; emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string; refreshToken: string;
  tokenType: string; expiresIn: number;
  user: UserSummary;
}

export interface UserResponse {
  id: number; firstName: string; lastName: string;
  email: string; phone?: string; role: UserRole; status: UserStatus;
  profilePhotoUrl?: string; bio?: string;
  emailVerified: boolean; createdAt: string;
}

export interface UserPageResponse {
  id: number; firstName: string; lastName: string;
  email: string; role: UserRole; status: UserStatus;
  profilePhotoUrl?: string; emailVerified: boolean;
  totalBookings: number; createdAt: string;
}

// ─── Property ────────────────────────────────────────────────────────────────
export type PropertyStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type PropertyType   = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CONDO' | 'COTTAGE' | 'STUDIO' | 'LOFT' | 'CABIN' | 'OTHER';

export interface PropertySummaryResponse {
  id: number; title: string;
  propertyType: PropertyType; status: PropertyStatus;
  basePrice: number; averageRating?: number; reviewCount?: number;
  maxGuests: number; bedrooms: number; bathrooms: number; beds: number;
  city: string; country: string;
  firstPhotoUrl?: string;
  hostId: number; hostName: string;
  createdAt: string;
}

// ─── Booking ─────────────────────────────────────────────────────────────────
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type BookingType   = 'INSTANT' | 'REQUEST';

export interface BookingResponse {
  id: number; status: BookingStatus; bookingType: BookingType;
  checkInDate: string; checkOutDate: string;
  guestsCount: number; nights: number;
  basePricePerNight: number; subtotal: number;
  cleaningFee?: number; serviceFee?: number; taxes?: number; totalPrice: number;
  specialRequests?: string; cancellationReason?: string;
  property: { id: number; title: string; city: string; country: string; primaryPhotoUrl?: string };
  guest:    { id: number; firstName: string; lastName: string; email: string; profilePhotoUrl?: string };
  payment?: { id: number; status: string; razorpayOrderId?: string; amount: number };
  createdAt: string;
}

// ─── Host Application ────────────────────────────────────────────────────────
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface HostApplicationResponse {
  id: number;
  userId: number; userEmail: string; userName: string;
  motivation: string; experience?: string; propertyCount?: number;
  status: ApplicationStatus;
  reviewedBy?: string; reviewNotes?: string;
  createdAt: string; reviewedAt?: string;
}

// ─── Admin DTOs ──────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number; activeListings: number;
  bookingsThisMonth: number; revenueThisMonth: number;
  pendingListings: number; pendingApplications: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface ListingModerationPayload {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'SUSPEND';
  reason?: string;
}

export interface HostApplicationReviewPayload {
  approved: boolean; notes?: string;
}

export interface PlatformConfigResponse {
  id: number; key: string; value: string; description?: string; updatedAt: string;
}

export interface PlatformConfigPayload {
  key: string; value: string; description?: string;
}
