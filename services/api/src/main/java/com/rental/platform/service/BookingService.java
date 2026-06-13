package com.rental.platform.service;

import com.rental.platform.config.AppProperties;
import com.rental.platform.domain.entity.*;
import com.rental.platform.domain.enums.*;
import com.rental.platform.domain.repository.*;
import com.rental.platform.dto.booking.*;
import com.rental.platform.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final AvailabilityRepository availabilityRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final AppProperties appProperties;

    @Transactional(readOnly = true)
    public PriceBreakdownResponse getPriceBreakdown(Long propertyId, BookingRequest request) {
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new ResourceNotFoundException("Property", propertyId));

        if (property.getStatus() != PropertyStatus.ACTIVE) {
            return PriceBreakdownResponse.builder()
                .available(false)
                .unavailabilityReason("Property is not available for booking")
                .build();
        }

        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            return PriceBreakdownResponse.builder()
                .available(false)
                .unavailabilityReason("Check-out date must be after check-in date")
                .build();
        }

        boolean hasConflict = bookingRepository.existsConflictingBooking(
            propertyId, request.getCheckInDate(), request.getCheckOutDate());

        if (hasConflict) {
            return PriceBreakdownResponse.builder()
                .available(false)
                .unavailabilityReason("Selected dates are not available")
                .build();
        }

        boolean hasBlockedDate = request.getCheckInDate()
            .datesUntil(request.getCheckOutDate())
            .anyMatch(date -> availabilityRepository
                .existsByPropertyIdAndDateAndBlockedTrue(propertyId, date));

        if (hasBlockedDate) {
            return PriceBreakdownResponse.builder()
                .available(false)
                .unavailabilityReason("Some dates in your selection are blocked by the host")
                .build();
        }

        int nights = (int) ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal subtotal = property.getBasePrice().multiply(BigDecimal.valueOf(nights));
        BigDecimal cleaningFee = property.getCleaningFee();
        BigDecimal serviceFee = subtotal.multiply(property.getServiceFeePercent())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal taxes = subtotal.add(cleaningFee).add(serviceFee)
            .multiply(property.getTaxPercent())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(cleaningFee).add(serviceFee).add(taxes);

        return PriceBreakdownResponse.builder()
            .nights(nights)
            .basePricePerNight(property.getBasePrice())
            .subtotal(subtotal)
            .cleaningFee(cleaningFee)
            .serviceFee(serviceFee)
            .taxes(taxes)
            .totalPrice(total)
            .available(true)
            .build();
    }

    @Transactional
    public BookingResponse createBooking(String guestEmail, BookingRequest request) {
        User guest = userRepository.findByEmail(guestEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Property property = propertyRepository.findById(request.getPropertyId())
            .orElseThrow(() -> new ResourceNotFoundException("Property", request.getPropertyId()));

        if (property.getStatus() != PropertyStatus.ACTIVE) {
            throw new BusinessException("This property is not available for booking");
        }

        if (property.getHost().getId().equals(guest.getId())) {
            throw new BusinessException("You cannot book your own property");
        }

        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new BusinessException("Check-out date must be after check-in date");
        }

        int nights = (int) ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());

        if (nights < property.getMinNights()) {
            throw new BusinessException("Minimum stay is " + property.getMinNights() + " nights");
        }

        if (nights > property.getMaxNights()) {
            throw new BusinessException("Maximum stay is " + property.getMaxNights() + " nights");
        }

        if (request.getGuestsCount() > property.getMaxGuests()) {
            throw new BusinessException("Maximum guests allowed is " + property.getMaxGuests());
        }

        boolean hasConflict = bookingRepository.existsConflictingBooking(
            property.getId(), request.getCheckInDate(), request.getCheckOutDate());
        if (hasConflict) {
            throw new BusinessException("Selected dates are not available");
        }

        BigDecimal subtotal = property.getBasePrice().multiply(BigDecimal.valueOf(nights));
        BigDecimal cleaningFee = property.getCleaningFee();
        BigDecimal serviceFee = subtotal.multiply(property.getServiceFeePercent())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal taxes = subtotal.add(cleaningFee).add(serviceFee)
            .multiply(property.getTaxPercent())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(cleaningFee).add(serviceFee).add(taxes);

        BookingStatus initialStatus = property.getBookingType() == BookingType.INSTANT
            ? BookingStatus.CONFIRMED
            : BookingStatus.PENDING;

        Booking booking = Booking.builder()
            .property(property)
            .guest(guest)
            .checkInDate(request.getCheckInDate())
            .checkOutDate(request.getCheckOutDate())
            .guestsCount(request.getGuestsCount())
            .nights(nights)
            .basePricePerNight(property.getBasePrice())
            .subtotal(subtotal)
            .cleaningFee(cleaningFee)
            .serviceFee(serviceFee)
            .taxes(taxes)
            .totalPrice(total)
            .status(initialStatus)
            .bookingType(property.getBookingType())
            .specialRequests(request.getSpecialRequests())
            .build();

        booking = bookingRepository.save(booking);
        log.info("Booking {} created for property {} by guest {}", booking.getId(), property.getId(), guestEmail);

        notificationService.notifyBookingCreated(booking);
        return toBookingResponse(booking);
    }

    @Transactional
    public BookingResponse confirmBooking(Long bookingId, String hostEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        if (!booking.getProperty().getHost().getEmail().equals(hostEmail)) {
            throw new UnauthorizedException("You are not the host of this property");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BusinessException("Only pending bookings can be confirmed");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);
        notificationService.notifyBookingConfirmed(booking);
        emailService.sendBookingConfirmation(booking.getGuest().getEmail(), "BK-" + booking.getId());
        return toBookingResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, String userEmail, BookingCancelRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isGuest = booking.getGuest().getEmail().equals(userEmail);
        boolean isHost = booking.getProperty().getHost().getEmail().equals(userEmail);
        boolean isAdmin = user.getRole() == UserRole.SUPER_ADMIN || user.getRole() == UserRole.SUPPORT_AGENT;

        if (!isGuest && !isHost && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("This booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(request.getReason());
        booking = bookingRepository.save(booking);

        notificationService.notifyBookingCancelled(booking);
        emailService.sendBookingCancellation(booking.getGuest().getEmail(), "BK-" + booking.getId());
        return toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean canAccess = booking.getGuest().getEmail().equals(userEmail)
            || booking.getProperty().getHost().getEmail().equals(userEmail)
            || user.getRole() == UserRole.SUPER_ADMIN
            || user.getRole() == UserRole.SUPPORT_AGENT;

        if (!canAccess) {
            throw new UnauthorizedException("Access denied");
        }

        return toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getGuestBookings(String guestEmail, Pageable pageable) {
        User guest = userRepository.findByEmail(guestEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByGuestId(guest.getId(), pageable).map(this::toBookingResponse);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getHostBookings(String hostEmail, BookingStatus status, Pageable pageable) {
        User host = userRepository.findByEmail(hostEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (status != null) {
            return bookingRepository.findByPropertyHostIdAndStatus(host.getId(), status, pageable)
                .map(this::toBookingResponse);
        }
        return bookingRepository.findByPropertyHostId(host.getId(), pageable).map(this::toBookingResponse);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(BookingStatus status, Pageable pageable) {
        if (status != null) {
            return bookingRepository.findByStatus(status, pageable).map(this::toBookingResponse);
        }
        return bookingRepository.findAll(pageable).map(this::toBookingResponse);
    }

    public BookingResponse toBookingResponse(Booking b) {
        String primaryPhoto = b.getProperty().getPhotos().stream()
            .filter(PropertyPhoto::isPrimary)
            .findFirst()
            .or(() -> b.getProperty().getPhotos().stream().findFirst())
            .map(PropertyPhoto::getUrl)
            .orElse(null);

        return BookingResponse.builder()
            .id(b.getId())
            .status(b.getStatus().name())
            .bookingType(b.getBookingType().name())
            .checkInDate(b.getCheckInDate())
            .checkOutDate(b.getCheckOutDate())
            .guestsCount(b.getGuestsCount())
            .nights(b.getNights())
            .basePricePerNight(b.getBasePricePerNight())
            .subtotal(b.getSubtotal())
            .cleaningFee(b.getCleaningFee())
            .serviceFee(b.getServiceFee())
            .taxes(b.getTaxes())
            .totalPrice(b.getTotalPrice())
            .specialRequests(b.getSpecialRequests())
            .cancellationReason(b.getCancellationReason())
            .property(BookingResponse.PropertySummary.builder()
                .id(b.getProperty().getId())
                .title(b.getProperty().getTitle())
                .city(b.getProperty().getLocation() != null ? b.getProperty().getLocation().getCity() : null)
                .country(b.getProperty().getLocation() != null ? b.getProperty().getLocation().getCountry() : null)
                .primaryPhotoUrl(primaryPhoto)
                .build())
            .guest(BookingResponse.GuestSummary.builder()
                .id(b.getGuest().getId())
                .firstName(b.getGuest().getFirstName())
                .lastName(b.getGuest().getLastName())
                .email(b.getGuest().getEmail())
                .profilePhotoUrl(b.getGuest().getProfilePhotoUrl())
                .build())
            .payment(b.getPayment() != null ? BookingResponse.PaymentSummary.builder()
                .id(b.getPayment().getId())
                .status(b.getPayment().getStatus().name())
                .razorpayOrderId(b.getPayment().getRazorpayOrderId())
                .amount(b.getPayment().getAmount())
                .build() : null)
            .createdAt(b.getCreatedAt())
            .build();
    }
}
