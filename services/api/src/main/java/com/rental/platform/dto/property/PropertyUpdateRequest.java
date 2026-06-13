package com.rental.platform.dto.property;

import com.rental.platform.domain.enums.BookingType;
import com.rental.platform.domain.enums.CancellationPolicy;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PropertyUpdateRequest {
    @Size(min = 10, max = 200) private String title;
    @Size(min = 50, max = 5000) private String description;
    @Min(1) @Max(50) private Integer maxGuests;
    @Min(0) @Max(50) private Integer bedrooms;
    @Min(1) @Max(50) private Integer bathrooms;
    @Min(1) @Max(100) private Integer beds;
    @DecimalMin("1.00") private BigDecimal basePrice;
    @DecimalMin("0.00") private BigDecimal cleaningFee;
    private BookingType bookingType;
    private CancellationPolicy cancellationPolicy;
    @Min(1) @Max(365) private Integer minNights;
    @Min(1) @Max(365) private Integer maxNights;
    private List<Long> amenityIds;
}
