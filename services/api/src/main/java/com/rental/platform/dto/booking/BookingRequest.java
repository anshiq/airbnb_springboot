package com.rental.platform.dto.booking;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date must be today or in the future")
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    private LocalDate checkOutDate;

    @NotNull @Min(1) @Max(50)
    private Integer guestsCount;

    @Size(max = 1000)
    private String specialRequests;
}
