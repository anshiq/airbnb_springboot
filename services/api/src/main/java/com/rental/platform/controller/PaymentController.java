package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.dto.payment.CreateOrderRequest;
import com.rental.platform.dto.payment.PaymentResponse;
import com.rental.platform.dto.payment.PaymentVerifyRequest;
import com.rental.platform.dto.payment.RefundRequest;
import com.rental.platform.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Razorpay payment integration — order creation, verification, and refunds")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    @Operation(summary = "Create a Razorpay order for a booking")
    public ResponseEntity<ApiResponse<PaymentResponse>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.createOrder(userDetails.getUsername(), request)));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment signature and capture the payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.verifyAndCapturePayment(request)));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get payment details for a booking")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getPaymentByBookingId(bookingId)));
    }

    @PostMapping("/refund")
    @Operation(summary = "Process a full or partial refund (admin only)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT_AGENT')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processRefund(
            @Valid @RequestBody RefundRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.processRefund(request, userDetails.getUsername())));
    }
}
