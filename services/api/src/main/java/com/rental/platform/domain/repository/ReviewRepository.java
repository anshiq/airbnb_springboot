package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByPropertyIdAndVisibleTrue(Long propertyId, Pageable pageable);

    Optional<Review> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.property.id = :propertyId AND r.visible = true")
    Optional<BigDecimal> findAverageRatingByPropertyId(@Param("propertyId") Long propertyId);

    long countByPropertyIdAndVisibleTrue(Long propertyId);

    Page<Review> findByReviewerId(Long reviewerId, Pageable pageable);
}
