package com.rental.platform.controller;

import com.rental.platform.common.response.ApiResponse;
import com.rental.platform.common.response.PageResponse;
import com.rental.platform.domain.enums.BookingStatus;
import com.rental.platform.dto.booking.*;
import com.rental.platform.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking lifecycle management for guests and hosts")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Booking created", response));
    }

    @GetMapping("/price-check")
    @Operation(summary = "Get price breakdown before booking")
    public ResponseEntity<ApiResponse<PriceBreakdownResponse>> getPriceBreakdown(
            @RequestParam Long propertyId,
            @Valid BookingRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getPriceBreakdown(propertyId, request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking details by ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id, userDetails.getUsername())));
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm a pending booking request (host only)")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.confirmBooking(id, userDetails.getUsername())));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingCancelRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.cancelBooking(id, userDetails.getUsername(), request)));
    }

    @GetMapping("/my-trips")
    @Operation(summary = "Get current guest's booking history")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getMyTrips(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(bookingService.getGuestBookings(userDetails.getUsername(), pageable))));
    }

    @GetMapping("/host/bookings")
    @Operation(summary = "Get all bookings for the current host's properties")
    @PreAuthorize("hasAnyRole('HOST', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getHostBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(bookingService.getHostBookings(userDetails.getUsername(), status, pageable))));
    }

    @GetMapping("/admin/all")
    @Operation(summary = "Get all platform bookings (admin only)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT_AGENT')")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(bookingService.getAllBookings(status, pageable))));
    }
}
