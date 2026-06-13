package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.Booking;
import com.rental.platform.domain.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    Page<Booking> findByGuestId(Long guestId, Pageable pageable);

    Page<Booking> findByPropertyId(Long propertyId, Pageable pageable);

    Page<Booking> findByPropertyHostId(Long hostId, Pageable pageable);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    List<Booking> findByPropertyIdAndStatusIn(Long propertyId, List<BookingStatus> statuses);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.property.id = :propertyId AND " +
           "b.status IN ('CONFIRMED', 'CHECKED_IN') AND " +
           "NOT (b.checkOutDate <= :checkIn OR b.checkInDate >= :checkOut)")
    boolean existsConflictingBooking(
        @Param("propertyId") Long propertyId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.status = 'COMPLETED' AND " +
           "YEAR(b.createdAt) = :year AND MONTH(b.createdAt) = :month")
    BigDecimal sumRevenueByMonth(@Param("year") int year, @Param("month") int month);

    long countByStatus(BookingStatus status);

    Page<Booking> findByPropertyHostIdAndStatus(Long hostId, BookingStatus status, Pageable pageable);
}
