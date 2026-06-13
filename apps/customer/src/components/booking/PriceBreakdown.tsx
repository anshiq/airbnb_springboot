import type { PriceBreakdownResponse } from "@/types";
import { formatCurrency } from "@/utils/format";

interface PriceBreakdownProps {
  breakdown: PriceBreakdownResponse;
}

export default function PriceBreakdown({ breakdown }: PriceBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          {formatCurrency(breakdown.basePricePerNight)} × {breakdown.nights}{" "}
          night{breakdown.nights !== 1 ? "s" : ""}
        </span>
        <span className="text-gray-900">
          {formatCurrency(breakdown.subtotal)}
        </span>
      </div>
      {breakdown.cleaningFee > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cleaning fee</span>
          <span className="text-gray-900">
            {formatCurrency(breakdown.cleaningFee)}
          </span>
        </div>
      )}
      {breakdown.serviceFee > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Service fee</span>
          <span className="text-gray-900">
            {formatCurrency(breakdown.serviceFee)}
          </span>
        </div>
      )}
      {breakdown.taxes > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Taxes</span>
          <span className="text-gray-900">
            {formatCurrency(breakdown.taxes)}
          </span>
        </div>
      )}
      <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
        <span className="text-gray-900">Total</span>
        <span className="text-gray-900">
          {formatCurrency(breakdown.totalPrice)}
        </span>
      </div>
    </div>
  );
}
