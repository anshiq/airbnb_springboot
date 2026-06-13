package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.Property;
import com.rental.platform.domain.enums.PropertyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>,
        JpaSpecificationExecutor<Property> {

    Page<Property> findByHostIdAndStatusNot(
            Long hostId,
            PropertyStatus status,
            Pageable pageable);

    Page<Property> findByStatus(
            PropertyStatus status,
            Pageable pageable);

    List<Property> findByHostIdAndStatus(
            Long hostId,
            PropertyStatus status);

    @Query("""
        SELECT p
        FROM Property p
        WHERE p.status = com.rental.platform.domain.enums.PropertyStatus.ACTIVE
        AND LOWER(p.location.city) LIKE LOWER(CONCAT('%', :city, '%'))
        AND p.maxGuests >= :guests
        AND p.basePrice BETWEEN :minPrice AND :maxPrice
        AND p.id NOT IN (
            SELECT b.property.id
            FROM Booking b
            WHERE b.status IN (
                com.rental.platform.domain.enums.BookingStatus.CONFIRMED,
                com.rental.platform.domain.enums.BookingStatus.CHECKED_IN
            )
            AND NOT (
                b.checkOutDate <= :checkIn
                OR b.checkInDate >= :checkOut
            )
        )
        """)
    Page<Property> searchAvailable(
            @Param("city") String city,
            @Param("guests") int guests,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            Pageable pageable);
    // Add these methods
    Optional<Property> findByIdAndStatusNot(Long id, PropertyStatus status);

    @Query("SELECT p FROM Property p WHERE p.host.email = :email")
    Page<Property> findByHostEmail(@Param("email") String email, Pageable pageable);

    boolean existsByIdAndHostId(Long id, Long hostId);

    @Modifying
    @Query("UPDATE Property p SET p.status = :status WHERE p.id = :id")
    void updateStatus(@Param("id") Long id, @Param("status") PropertyStatus status);

    long countByStatus(PropertyStatus status);

    Optional<Property> findByIdAndHostId(Long id, Long hostId);
}