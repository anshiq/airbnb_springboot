package com.rental.platform.dto.booking;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PriceBreakdownResponse {
    private Integer nights;
    private BigDecimal basePricePerNight;
    private BigDecimal subtotal;
    private BigDecimal cleaningFee;
    private BigDecimal serviceFee;
    private BigDecimal taxes;
    private BigDecimal totalPrice;
    private boolean available;
    private String unavailabilityReason;
}
