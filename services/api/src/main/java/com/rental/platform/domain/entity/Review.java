package com.rental.platform.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Column(name = "overall_rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal overallRating;

    @Column(name = "cleanliness_rating", precision = 2, scale = 1)
    private BigDecimal cleanlinessRating;

    @Column(name = "accuracy_rating", precision = 2, scale = 1)
    private BigDecimal accuracyRating;

    @Column(name = "checkin_rating", precision = 2, scale = 1)
    private BigDecimal checkinRating;

    @Column(name = "communication_rating", precision = 2, scale = 1)
    private BigDecimal communicationRating;

    @Column(name = "location_rating", precision = 2, scale = 1)
    private BigDecimal locationRating;

    @Column(name = "value_rating", precision = 2, scale = 1)
    private BigDecimal valueRating;

    @Column(name = "comment", nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "host_response", columnDefinition = "TEXT")
    private String hostResponse;

    @Column(name = "host_response_at")
    private Instant hostResponseAt;

    @Column(name = "is_visible", nullable = false)
    @Builder.Default
    private boolean visible = true;

    @Column(name = "guest_submitted_at")
    private Instant guestSubmittedAt;
}
