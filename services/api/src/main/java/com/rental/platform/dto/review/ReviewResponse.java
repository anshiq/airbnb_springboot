package com.rental.platform.dto.review;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReviewResponse {
    private Long id;
    private Long bookingId;
    private Long propertyId;
    private String propertyTitle;
    private ReviewerSummary reviewer;
    private BigDecimal overallRating;
    private BigDecimal cleanlinessRating;
    private BigDecimal accuracyRating;
    private BigDecimal checkinRating;
    private BigDecimal communicationRating;
    private BigDecimal locationRating;
    private BigDecimal valueRating;
    private String comment;
    private String hostResponse;
    private Instant hostResponseAt;
    private Instant createdAt;

    @Data
    @Builder
    public static class ReviewerSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String profilePhotoUrl;
    }
}
