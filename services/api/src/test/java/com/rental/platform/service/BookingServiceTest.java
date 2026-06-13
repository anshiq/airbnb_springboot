package com.rental.platform.service;

import com.rental.platform.config.AppProperties;
import com.rental.platform.domain.entity.Property;
import com.rental.platform.domain.entity.User;
import com.rental.platform.domain.enums.*;
import com.rental.platform.domain.repository.*;
import com.rental.platform.dto.booking.BookingRequest;
import com.rental.platform.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock PropertyRepository propertyRepository;
    @Mock UserRepository userRepository;
    @Mock AvailabilityRepository availabilityRepository;
    @Mock NotificationService notificationService;
    @Mock EmailService emailService;
    @Mock AppProperties appProperties;

    @InjectMocks
    BookingService bookingService;

    @Test
    void createBooking_hostBookingOwnProperty_throwsBusinessException() {
        User host = buildUser(1L, "host@test.com", UserRole.HOST);
        Property property = buildProperty(1L, host, PropertyStatus.ACTIVE);

        when(userRepository.findByEmail("host@test.com")).thenReturn(Optional.of(host));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        BookingRequest request = new BookingRequest();
        request.setPropertyId(1L);
        request.setCheckInDate(LocalDate.now().plusDays(1));
        request.setCheckOutDate(LocalDate.now().plusDays(3));
        request.setGuestsCount(2);

        assertThatThrownBy(() -> bookingService.createBooking("host@test.com", request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cannot book your own property");
    }

    @Test
    void createBooking_inactiveProperty_throwsBusinessException() {
        User guest = buildUser(2L, "guest@test.com", UserRole.GUEST);
        User host = buildUser(1L, "host@test.com", UserRole.HOST);
        Property property = buildProperty(1L, host, PropertyStatus.PENDING_REVIEW);

        when(userRepository.findByEmail("guest@test.com")).thenReturn(Optional.of(guest));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        BookingRequest request = new BookingRequest();
        request.setPropertyId(1L);
        request.setCheckInDate(LocalDate.now().plusDays(1));
        request.setCheckOutDate(LocalDate.now().plusDays(3));
        request.setGuestsCount(2);

        assertThatThrownBy(() -> bookingService.createBooking("guest@test.com", request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not available for booking");
    }

    @Test
    void createBooking_conflictingDates_throwsBusinessException() {
        User guest = buildUser(2L, "guest@test.com", UserRole.GUEST);
        User host = buildUser(1L, "host@test.com", UserRole.HOST);
        Property property = buildProperty(1L, host, PropertyStatus.ACTIVE);

        when(userRepository.findByEmail("guest@test.com")).thenReturn(Optional.of(guest));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(bookingRepository.existsConflictingBooking(any(), any(), any())).thenReturn(true);

        BookingRequest request = new BookingRequest();
        request.setPropertyId(1L);
        request.setCheckInDate(LocalDate.now().plusDays(1));
        request.setCheckOutDate(LocalDate.now().plusDays(3));
        request.setGuestsCount(2);

        assertThatThrownBy(() -> bookingService.createBooking("guest@test.com", request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void getPriceBreakdown_validRequest_returnsCorrectPricing() {
        User host = buildUser(1L, "host@test.com", UserRole.HOST);
        Property property = buildProperty(1L, host, PropertyStatus.ACTIVE);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(bookingRepository.existsConflictingBooking(any(), any(), any())).thenReturn(false);
        when(availabilityRepository.existsByPropertyIdAndDateAndBlockedTrue(any(), any())).thenReturn(false);

        BookingRequest request = new BookingRequest();
        request.setPropertyId(1L);
        request.setCheckInDate(LocalDate.now().plusDays(1));
        request.setCheckOutDate(LocalDate.now().plusDays(4)); // 3 nights
        request.setGuestsCount(2);

        var breakdown = bookingService.getPriceBreakdown(1L, request);

        assertThat(breakdown.isAvailable()).isTrue();
        assertThat(breakdown.getNights()).isEqualTo(3);
        // base: 100 * 3 = 300
        assertThat(breakdown.getSubtotal()).isEqualByComparingTo(new BigDecimal("300.00"));
        // service fee: 300 * 12% = 36
        assertThat(breakdown.getServiceFee()).isEqualByComparingTo(new BigDecimal("36.00"));
    }

    @Test
    void getPriceBreakdown_unavailableDates_returnsUnavailableResponse() {
        User host = buildUser(1L, "host@test.com", UserRole.HOST);
        Property property = buildProperty(1L, host, PropertyStatus.ACTIVE);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(bookingRepository.existsConflictingBooking(any(), any(), any())).thenReturn(true);

        BookingRequest request = new BookingRequest();
        request.setPropertyId(1L);
        request.setCheckInDate(LocalDate.now().plusDays(1));
        request.setCheckOutDate(LocalDate.now().plusDays(3));
        request.setGuestsCount(2);

        var breakdown = bookingService.getPriceBreakdown(1L, request);

        assertThat(breakdown.isAvailable()).isFalse();
        assertThat(breakdown.getUnavailabilityReason()).isNotBlank();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private User buildUser(Long id, String email, UserRole role) {
        User u = User.builder()
                .email(email).role(role).status(UserStatus.ACTIVE)
                .firstName("Test").lastName("User").password("pass")
                .properties(new ArrayList<>()).bookings(new ArrayList<>())
                .build();
        setEntityId(u, id);
        return u;
    }

    private Property buildProperty(Long id, User host, PropertyStatus status) {
        Property p = Property.builder()
                .host(host).title("Test Property").description("A nice place")
                .propertyType(PropertyType.APARTMENT).status(status)
                .maxGuests(4).bedrooms(2).bathrooms(1).beds(2)
                .basePrice(new BigDecimal("100.00"))
                .cleaningFee(new BigDecimal("20.00"))
                .serviceFeePercent(new BigDecimal("12.00"))
                .taxPercent(new BigDecimal("8.00"))
                .bookingType(BookingType.INSTANT)
                .cancellationPolicy(CancellationPolicy.MODERATE)
                .minNights(1).maxNights(365)
                .photos(new ArrayList<>())
                .amenities(new HashSet<>())
                .availabilities(new ArrayList<>())
                .bookings(new ArrayList<>())
                .build();
        setEntityId(p, id);
        return p;
    }

    private void setEntityId(Object entity, Long id) {
        try {
            var field = com.rental.platform.domain.entity.BaseEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception ignored) {
        }
    }
}
