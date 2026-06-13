package com.rental.platform.dto.property;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
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
    private LocationResponse location;
    private List<PhotoResponse> photos;
    private List<AmenityResponse> amenities;
    private HostSummary host;
    private Instant createdAt;

    @Data
    @Builder
    public static class LocationResponse {
        private Long id;
        private String addressLine1;
        private String city;
        private String state;
        private String country;
        private String zipCode;
        private Double latitude;
        private Double longitude;
    }

    @Data
    @Builder
    public static class PhotoResponse {
        private Long id;
        private String url;
        private String caption;
        private boolean primary;
        private int displayOrder;
    }

    @Data
    @Builder
    public static class AmenityResponse {
        private Long id;
        private String name;
        private String category;
        private String icon;
    }

    @Data
    @Builder
    public static class HostSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String profilePhotoUrl;
        private Instant memberSince;
    }
}
