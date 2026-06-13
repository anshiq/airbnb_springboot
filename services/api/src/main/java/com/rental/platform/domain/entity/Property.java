package com.rental.platform.domain.entity;

import com.rental.platform.domain.enums.BookingType;
import com.rental.platform.domain.enums.CancellationPolicy;
import com.rental.platform.domain.enums.PropertyStatus;
import com.rental.platform.domain.enums.PropertyType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "properties", indexes = {
    @Index(name = "idx_properties_host", columnList = "host_id"),
    @Index(name = "idx_properties_status", columnList = "status"),
    @Index(name = "idx_properties_type", columnList = "property_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PropertyStatus status = PropertyStatus.DRAFT;

    @Column(name = "max_guests", nullable = false)
    private Integer maxGuests;

    @Column(name = "bedrooms", nullable = false)
    private Integer bedrooms;

    @Column(name = "bathrooms", nullable = false)
    private Integer bathrooms;

    @Column(name = "beds", nullable = false)
    private Integer beds;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "cleaning_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cleaningFee = BigDecimal.ZERO;

    @Column(name = "service_fee_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal serviceFeePercent = new BigDecimal("12.00");

    @Column(name = "tax_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxPercent = new BigDecimal("8.00");

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type", nullable = false)
    @Builder.Default
    private BookingType bookingType = BookingType.INSTANT;

    @Enumerated(EnumType.STRING)
    @Column(name = "cancellation_policy", nullable = false)
    @Builder.Default
    private CancellationPolicy cancellationPolicy = CancellationPolicy.MODERATE;

    @Column(name = "min_nights")
    @Builder.Default
    private Integer minNights = 1;

    @Column(name = "max_nights")
    @Builder.Default
    private Integer maxNights = 365;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "location_id")
    private Location location;
@OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<PropertyPhoto> photos = new ArrayList<>();
    @ManyToMany
    @JoinTable(
        name = "property_amenities",
        joinColumns = @JoinColumn(name = "property_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    @Builder.Default
    private Set<Amenity> amenities = new HashSet<>();

    @OneToMany(mappedBy = "property", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Availability> availabilities = new ArrayList<>();

    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;
}
