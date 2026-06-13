package com.rental.platform.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RefundRequest {
    @NotNull
    private Long bookingId;

    @DecimalMin("0.01")
    private BigDecimal amount; // null = full refund
}
