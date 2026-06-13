package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByPropertyIdAndDateBetween(Long propertyId, LocalDate start, LocalDate end);

    boolean existsByPropertyIdAndDateAndBlockedTrue(Long propertyId, LocalDate date);

    @Modifying
    @Query("DELETE FROM Availability a WHERE a.property.id = :propertyId AND a.date BETWEEN :start AND :end")
    void deleteByPropertyIdAndDateBetween(
        @Param("propertyId") Long propertyId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end);
}
