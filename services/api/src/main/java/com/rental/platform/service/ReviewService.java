package com.rental.platform.service;

import com.rental.platform.domain.entity.*;
import com.rental.platform.domain.enums.BookingStatus;
import com.rental.platform.domain.repository.*;
import com.rental.platform.dto.review.*;
import com.rental.platform.exception.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse createReview(String guestEmail, ReviewRequest request) {
        User guest = userRepository.findByEmail(guestEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId()));

        if (!booking.getGuest().getEmail().equals(guestEmail)) {
            throw new UnauthorizedException("You can only review your own bookings");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BusinessException("You can only review completed stays");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new DuplicateResourceException("You have already reviewed this booking");
        }

        Review review = Review.builder()
            .booking(booking)
            .property(booking.getProperty())
            .reviewer(guest)
            .overallRating(request.getOverallRating())
            .cleanlinessRating(request.getCleanlinessRating())
            .accuracyRating(request.getAccuracyRating())
            .checkinRating(request.getCheckinRating())
            .communicationRating(request.getCommunicationRating())
            .locationRating(request.getLocationRating())
            .valueRating(request.getValueRating())
            .comment(request.getComment())
            .guestSubmittedAt(Instant.now())
            .visible(true)
            .build();

        reviewRepository.save(review);
        updatePropertyRating(booking.getProperty().getId());
        return toReviewResponse(review);
    }

    @Transactional
    public ReviewResponse addHostResponse(Long reviewId, String hostEmail, HostResponseRequest request) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getProperty().getHost().getEmail().equals(hostEmail)) {
            throw new UnauthorizedException("You can only respond to reviews on your properties");
        }

        review.setHostResponse(request.getResponse());
        review.setHostResponseAt(Instant.now());
        return toReviewResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPropertyReviews(Long propertyId, Pageable pageable) {
        return reviewRepository.findByPropertyIdAndVisibleTrue(propertyId, pageable).map(this::toReviewResponse);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getUserReviews(String guestEmail, Pageable pageable) {
        User guest = userRepository.findByEmail(guestEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reviewRepository.findByReviewerId(guest.getId(), pageable).map(this::toReviewResponse);
    }

    private void updatePropertyRating(Long propertyId) {
        BigDecimal avg = reviewRepository.findAverageRatingByPropertyId(propertyId).orElse(BigDecimal.ZERO);
        long count = reviewRepository.countByPropertyIdAndVisibleTrue(propertyId);
        Property property = propertyRepository.findById(propertyId).orElseThrow();
        property.setAverageRating(avg.setScale(2, RoundingMode.HALF_UP));
        property.setReviewCount((int) count);
        propertyRepository.save(property);
    }

    private ReviewResponse toReviewResponse(Review r) {
        return ReviewResponse.builder()
            .id(r.getId())
            .bookingId(r.getBooking().getId())
            .propertyId(r.getProperty().getId())
            .propertyTitle(r.getProperty().getTitle())
            .reviewer(ReviewResponse.ReviewerSummary.builder()
                .id(r.getReviewer().getId())
                .firstName(r.getReviewer().getFirstName())
                .lastName(r.getReviewer().getLastName())
                .profilePhotoUrl(r.getReviewer().getProfilePhotoUrl())
                .build())
            .overallRating(r.getOverallRating())
            .cleanlinessRating(r.getCleanlinessRating())
            .accuracyRating(r.getAccuracyRating())
            .checkinRating(r.getCheckinRating())
            .communicationRating(r.getCommunicationRating())
            .locationRating(r.getLocationRating())
            .valueRating(r.getValueRating())
            .comment(r.getComment())
            .hostResponse(r.getHostResponse())
            .hostResponseAt(r.getHostResponseAt())
            .createdAt(r.getCreatedAt())
            .build();
    }
}
