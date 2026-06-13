package com.rental.platform.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.rental.platform.config.AppProperties;
import com.rental.platform.domain.entity.Booking;
import com.rental.platform.domain.entity.Payment;
import com.rental.platform.domain.enums.BookingStatus;
import com.rental.platform.domain.enums.PaymentStatus;
import com.rental.platform.domain.repository.BookingRepository;
import com.rental.platform.domain.repository.PaymentRepository;
import com.rental.platform.dto.payment.*;
import com.rental.platform.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final AppProperties appProperties;

    @Transactional
    public PaymentResponse createOrder(String userEmail, CreateOrderRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId()));

        if (!booking.getGuest().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("You can only pay for your own bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BusinessException("Booking is not in a payable state");
        }

        if (paymentRepository.findByBookingId(booking.getId())
                .filter(p -> p.getStatus() == PaymentStatus.CAPTURED).isPresent()) {
            throw new BusinessException("This booking has already been paid");
        }

        try {
            RazorpayClient client = new RazorpayClient(
                appProperties.getRazorpay().getKeyId(),
                appProperties.getRazorpay().getKeySecret());

            JSONObject orderRequest = new JSONObject();
            // Razorpay expects amount in paise (INR cents)
            long amountInPaise = booking.getTotalPrice().multiply(BigDecimal.valueOf(100)).longValue();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "BK-" + booking.getId());

            Order razorpayOrder = client.orders.create(orderRequest);

            Payment payment = paymentRepository.findByBookingId(booking.getId())
                .orElse(Payment.builder().booking(booking).build());
            payment.setAmount(booking.getTotalPrice());
            payment.setCurrency("INR");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setRazorpayOrderId(razorpayOrder.get("id"));

            return toPaymentResponse(paymentRepository.save(payment));
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new PaymentException("Failed to create payment order: " + e.getMessage(), e);
        }
    }

    @Transactional
    public PaymentResponse verifyAndCapturePayment(PaymentVerifyRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + request.getRazorpayOrderId()));

        boolean signatureValid = verifySignature(
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            request.getRazorpaySignature());

        if (!signatureValid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Signature verification failed");
            paymentRepository.save(payment);
            throw new PaymentException("Payment signature verification failed");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setCapturedAt(Instant.now());

        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse processRefund(RefundRequest request, String adminEmail) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId()));

        Payment payment = paymentRepository.findByBookingId(booking.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking"));

        if (payment.getStatus() != PaymentStatus.CAPTURED) {
            throw new BusinessException("Only captured payments can be refunded");
        }

        BigDecimal refundAmount = request.getAmount() != null ? request.getAmount() : payment.getAmount();

        try {
            RazorpayClient client = new RazorpayClient(
                appProperties.getRazorpay().getKeyId(),
                appProperties.getRazorpay().getKeySecret());

            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", refundAmount.multiply(BigDecimal.valueOf(100)).longValue());

            com.razorpay.Refund refund = client.payments.refund(payment.getRazorpayPaymentId(), refundRequest);

            payment.setRefundAmount(refundAmount);
            payment.setRazorpayRefundId(refund.get("id"));
            payment.setStatus(request.getAmount() != null && request.getAmount().compareTo(payment.getAmount()) < 0
                ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED);
            payment.setRefundedAt(Instant.now());

            booking.setStatus(BookingStatus.REFUNDED);
            bookingRepository.save(booking);

            return toPaymentResponse(paymentRepository.save(payment));
        } catch (RazorpayException e) {
            log.error("Razorpay refund failed: {}", e.getMessage());
            throw new PaymentException("Refund failed: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
            .map(this::toPaymentResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking"));
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                appProperties.getRazorpay().getKeySecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error", e);
            return false;
        }
    }

    private PaymentResponse toPaymentResponse(Payment p) {
        return PaymentResponse.builder()
            .id(p.getId())
            .bookingId(p.getBooking().getId())
            .amount(p.getAmount())
            .currency(p.getCurrency())
            .status(p.getStatus().name())
            .razorpayOrderId(p.getRazorpayOrderId())
            .razorpayPaymentId(p.getRazorpayPaymentId())
            .refundAmount(p.getRefundAmount())
            .capturedAt(p.getCapturedAt())
            .refundedAt(p.getRefundedAt())
            .build();
    }
}
