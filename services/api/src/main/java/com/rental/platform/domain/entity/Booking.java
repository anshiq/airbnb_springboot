package com.rental.platform.domain.entity;

import com.rental.platform.domain.enums.BookingStatus;
import com.rental.platform.domain.enums.BookingType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_bookings_guest", columnList = "guest_id"),
    @Index(name = "idx_bookings_property", columnList = "property_id"),
    @Index(name = "idx_bookings_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private User guest;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "guests_count", nullable = false)
    private Integer guestsCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type", nullable = false)
    private BookingType bookingType;

    @Column(name = "nights", nullable = false)
    private Integer nights;

    @Column(name = "base_price_per_night", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePricePerNight;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "cleaning_fee", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cleaningFee = BigDecimal.ZERO;

    @Column(name = "service_fee", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal serviceFee = BigDecimal.ZERO;

    @Column(name = "taxes", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxes = BigDecimal.ZERO;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Payment payment;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Review review;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();
}
