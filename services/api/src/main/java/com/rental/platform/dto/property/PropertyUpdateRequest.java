package com.rental.platform.dto.property;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyUpdateRequest {

    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;

    private String propertyType;

    @Min(value = 1, message = "Max guests must be at least 1")
    private Integer maxGuests;

    @Min(value = 0)
    private Integer bedrooms;

    @Min(value = 0)
    private Integer bathrooms;

    @Min(value = 1)
    private Integer beds;

    @DecimalMin(value = "0.01", message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    private BigDecimal cleaningFee;

    private String bookingType;

    private String cancellationPolicy;

    private Integer minNights;

    private Integer maxNights;

    @Valid
    private PropertyRequest.LocationRequest location;

    private List<Long> amenityIds;
}