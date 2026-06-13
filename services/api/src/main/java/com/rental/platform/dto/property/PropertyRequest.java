package com.rental.platform.dto.property;

import com.rental.platform.domain.enums.BookingType;
import com.rental.platform.domain.enums.CancellationPolicy;
import com.rental.platform.domain.enums.PropertyType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PropertyRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 10, max = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 50, max = 5000)
    private String description;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    @NotNull @Min(1) @Max(50)
    private Integer maxGuests;

    @NotNull @Min(0) @Max(50)
    private Integer bedrooms;

    @NotNull @Min(1) @Max(50)
    private Integer bathrooms;

    @NotNull @Min(1) @Max(100)
    private Integer beds;

    @NotNull
    @DecimalMin("1.00")
    @DecimalMax("100000.00")
    private BigDecimal basePrice;

    @DecimalMin("0.00")
    private BigDecimal cleaningFee;

    private BookingType bookingType;
    private CancellationPolicy cancellationPolicy;

    @Min(1) @Max(365)
    private Integer minNights;

    @Min(1) @Max(365)
    private Integer maxNights;

    @NotNull @Valid
    private LocationRequest location;

    private List<Long> amenityIds;
    private List<PhotoRequest> photos;

    @Data
    public static class LocationRequest {
        @NotBlank private String addressLine1;
        private String addressLine2;
        @NotBlank private String city;
        private String state;
        @NotBlank private String country;
        private String zipCode;
        private Double latitude;
        private Double longitude;
    }

    @Data
    public static class PhotoRequest {
        @NotBlank private String url;
        private String caption;
        private boolean primary;
        private int displayOrder;
    }
}
