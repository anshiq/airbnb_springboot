package com.rental.platform.domain.repository;

import com.rental.platform.domain.entity.Payment;
import com.rental.platform.domain.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    Optional<Payment> findByRazorpayOrderId(String orderId);

    Optional<Payment> findByRazorpayPaymentId(String paymentId);

    long countByStatus(PaymentStatus status);
}
