package com.rental.platform.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentVerifyRequest {
    @NotBlank private String razorpayOrderId;
    @NotBlank private String razorpayPaymentId;
    @NotBlank private String razorpaySignature;
}
