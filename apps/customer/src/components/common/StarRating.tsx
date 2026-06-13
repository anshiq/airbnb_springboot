import { cn } from "@/utils/cn";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeClasses = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-7 h-7" };

export default function StarRating({
  value,
  onChange,
  size = "md",
  showValue,
  className,
}: StarRatingProps) {
  const isInteractive = !!onChange;
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!isInteractive}
          onClick={() => onChange?.(star)}
          className={cn(
            sizeClasses[size],
            "transition-colors",
            isInteractive ? "cursor-pointer hover:scale-110" : "cursor-default",
          )}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <svg
            viewBox="0 0 20 20"
            fill={star <= Math.round(value) ? "#f59e0b" : "none"}
            stroke="#f59e0b"
            strokeWidth="1.5"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
