package com.rental.platform.dto.payment;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private BigDecimal refundAmount;
    private Instant capturedAt;
    private Instant refundedAt;
}
