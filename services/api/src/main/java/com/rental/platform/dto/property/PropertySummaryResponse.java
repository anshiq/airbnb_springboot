package com.rental.platform.dto.property;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PropertySummaryResponse {

    private Long id;
    private String title;
    private String propertyType;
    private String status;
    private BigDecimal basePrice;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer beds;
    private String city;
    private String country;
    private String firstPhotoUrl;
    private Long hostId;
    private String hostName;
    private Instant createdAt;
}
