package com.rental.platform.dto.property;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponse {

    private Long id;
    private String title;
    private String description;
    private String propertyType;
    private String status;

    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer beds;

    private BigDecimal basePrice;
    private BigDecimal cleaningFee;
    private BigDecimal serviceFeePercent;
    private BigDecimal taxPercent;

    private String bookingType;
    private String cancellationPolicy;
    private Integer minNights;
    private Integer maxNights;

    private BigDecimal averageRating;
    private Integer reviewCount;

    private Long hostId;
    private String hostName;

    private LocationResponse location;
    private List<PhotoResponse> photos;


    private Instant createdAt;
    private Instant updatedAt;
    private List<AmenityResponse> amenities;
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AmenityResponse {
        private Long id;
        private String name;
        private String category;
        private String icon;
    }

    // ------------------------------------------------------------------ //
    //  Nested: LocationResponse
    // ------------------------------------------------------------------ //
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LocationResponse {
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String country;
        private String zipCode;
        private Double latitude;
        private Double longitude;
    }

    // ------------------------------------------------------------------ //
    //  Nested: PhotoResponse
    // ------------------------------------------------------------------ //
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PhotoResponse {
        private Long id;
        private String url;
        private String caption;
        private boolean primary;
        private int displayOrder;
    }
}