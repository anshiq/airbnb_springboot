package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByBookingIdOrderByCreatedAtAsc(Long bookingId, Pageable pageable);

    long countByBookingIdAndReadFalseAndSenderIdNot(Long bookingId, Long senderId);

    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.booking.id = :bookingId AND m.sender.id != :userId")
    void markMessagesAsRead(@Param("bookingId") Long bookingId, @Param("userId") Long userId);
}
