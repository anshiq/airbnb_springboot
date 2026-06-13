import { cn } from "@/utils/cn";
import type { BookingStatus, PropertyStatus, ApplicationStatus } from "@/types";

export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-gray-100 text-gray-700",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export default function Badge({
  variant = "neutral",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function bookingStatusVariant(status: BookingStatus): BadgeVariant {
  const map: Record<BookingStatus, BadgeVariant> = {
    CONFIRMED: "success",
    PENDING: "warning",
    COMPLETED: "info",
    CANCELLED: "neutral",
    REJECTED: "error",
  };
  return map[status] ?? "neutral";
}

export function propertyStatusVariant(status: PropertyStatus): BadgeVariant {
  const map: Record<PropertyStatus, BadgeVariant> = {
    ACTIVE: "success",
    PENDING_REVIEW: "warning",
    SUSPENDED: "error",
    DRAFT: "neutral",
    ARCHIVED: "neutral",
  };
  return map[status] ?? "neutral";
}

export function applicationStatusVariant(
  status: ApplicationStatus,
): BadgeVariant {
  const map: Record<ApplicationStatus, BadgeVariant> = {
    APPROVED: "success",
    PENDING: "warning",
    REJECTED: "error",
  };
  return map[status] ?? "neutral";
}
