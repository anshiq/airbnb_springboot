package com.rental.platform.dto.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingCancelRequest {
    @NotBlank(message = "Cancellation reason is required")
    private String reason;
}
