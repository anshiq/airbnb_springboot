package com.rental.platform.dto.booking;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {
    private Long id;
    private String status;
    private String bookingType;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guestsCount;
    private Integer nights;
    private BigDecimal basePricePerNight;
    private BigDecimal subtotal;
    private BigDecimal cleaningFee;
    private BigDecimal serviceFee;
    private BigDecimal taxes;
    private BigDecimal totalPrice;
    private String specialRequests;
    private String cancellationReason;
    private PropertySummary property;
    private GuestSummary guest;
    private PaymentSummary payment;
    private Instant createdAt;

    @Data
    @Builder
    public static class PropertySummary {
        private Long id;
        private String title;
        private String city;
        private String country;
        private String primaryPhotoUrl;
    }

    @Data
    @Builder
    public static class GuestSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String profilePhotoUrl;
    }

    @Data
    @Builder
    public static class PaymentSummary {
        private Long id;
        private String status;
        private String razorpayOrderId;
        private BigDecimal amount;
    }
}
