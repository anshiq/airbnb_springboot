import type { ReviewResponse } from "@/types";
import { formatRelativeTime, getInitials } from "@/utils/format";
import StarRating from "@/components/common/StarRating";

export default function ReviewCard({ review }: { review: ReviewResponse }) {
  return (
    <div className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start gap-3 mb-3">
        {review.guestPhotoUrl ? (
          <img
            src={review.guestPhotoUrl}
            alt={review.guestName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
            {getInitials(
              review.guestName.split(" ")[0] ?? "",
              review.guestName.split(" ")[1] ?? "",
            )}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900 text-sm">
            {review.guestName}
          </p>
          <div className="flex items-center gap-2">
            <StarRating value={review.overallRating} size="sm" />
            <span className="text-xs text-gray-400">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>

      {review.hostResponse && (
        <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-1">
            Response from host
          </p>
          <p className="text-sm text-gray-600">{review.hostResponse}</p>
        </div>
      )}
    </div>
  );
}
