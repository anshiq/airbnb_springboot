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
public class PropertyRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Property type is required")
    private String propertyType;

    @NotNull(message = "Max guests is required")
    @Min(value = 1, message = "Max guests must be at least 1")
    private Integer maxGuests;

    @NotNull(message = "Bedrooms is required")
    @Min(value = 0)
    private Integer bedrooms;

    @NotNull(message = "Bathrooms is required")
    @Min(value = 0)
    private Integer bathrooms;

    @NotNull(message = "Beds is required")
    @Min(value = 1)
    private Integer beds;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.01", message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    private BigDecimal cleaningFee;

    private String bookingType;

    private String cancellationPolicy;

    private Integer minNights;

    private Integer maxNights;

    @Valid
    private LocationRequest location;

    private List<Long> amenityIds;

    private List<PhotoRequest> photos;

    // ------------------------------------------------------------------ //
    //  Nested: LocationRequest
    // ------------------------------------------------------------------ //
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LocationRequest {

        @NotBlank(message = "Address line 1 is required")
        private String addressLine1;

        private String addressLine2;

        @NotBlank(message = "City is required")
        private String city;

        private String state;

        @NotBlank(message = "Country is required")
        private String country;

        private String zipCode;

        private Double latitude;

        private Double longitude;
    }

    // ------------------------------------------------------------------ //
    //  Nested: PhotoRequest
    // ------------------------------------------------------------------ //
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PhotoRequest {

        @NotBlank(message = "Photo URL is required")
        private String url;

        @Size(max = 200)
        private String caption;

        private boolean primary;

        private int displayOrder;
    }
}