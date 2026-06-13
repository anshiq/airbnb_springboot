package com.rental.platform.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotNull
    private Long bookingId;
}
